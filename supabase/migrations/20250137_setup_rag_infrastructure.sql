-- Enable the pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Create an enum for document types
CREATE TYPE document_type AS ENUM ('faq', 'policy', 'help_article', 'api_doc');

-- Create the documents table
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    doc_type document_type NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true
);

-- Create the document chunks table for storing embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER NOT NULL,
    embedding vector(1536), -- OpenAI's text-embedding-ada-002 uses 1536 dimensions
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_metadata ON documents USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_metadata ON document_chunks USING GIN (metadata);

-- Create a vector similarity search index
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_chunks_updated_at
    BEFORE UPDATE ON document_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to documents for authenticated users"
    ON documents FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Allow read access to document chunks for authenticated users
CREATE POLICY "Allow read access to document chunks for authenticated users"
    ON document_chunks FOR SELECT
    TO authenticated
    USING (true);

-- Allow full access to service role
CREATE POLICY "Allow full access to documents for service role"
    ON documents FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow full access to document chunks for service role
CREATE POLICY "Allow full access to document chunks for service role"
    ON document_chunks FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Comments for better documentation
COMMENT ON TABLE documents IS 'Stores the original documents used for RAG';
COMMENT ON TABLE document_chunks IS 'Stores document chunks with their embeddings for semantic search';
COMMENT ON COLUMN documents.metadata IS 'Flexible metadata storage for filtering and categorization';
COMMENT ON COLUMN document_chunks.embedding IS 'Vector embedding generated from OpenAI text-embedding-ada-002';

-- Create function to insert document chunks with proper type handling
CREATE OR REPLACE FUNCTION insert_document_chunk(
    document_id UUID,
    chunk_index INTEGER,
    content TEXT,
    token_count INTEGER,
    embedding NUMERIC[],
    metadata JSONB
) RETURNS void AS $$
BEGIN
    INSERT INTO document_chunks (
        document_id,
        chunk_index,
        content,
        token_count,
        embedding,
        metadata
    ) VALUES (
        document_id,
        chunk_index,
        content,
        token_count,
        embedding::vector,
        metadata
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
