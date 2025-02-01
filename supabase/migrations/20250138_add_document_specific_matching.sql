-- Enable the vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Update existing match_document_chunks function to support document-specific filtering
CREATE OR REPLACE FUNCTION match_document_chunks(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    filter_document_id uuid DEFAULT NULL
)
RETURNS TABLE (
    content text,
    similarity float,
    metadata jsonb,
    document_id uuid,
    id uuid,
    token_count int
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.content,
        1 - (dc.embedding <=> query_embedding) as similarity,
        dc.metadata,
        dc.document_id,
        dc.id,
        dc.token_count
    FROM document_chunks dc
    WHERE
        CASE
            WHEN filter_document_id IS NOT NULL THEN dc.document_id = filter_document_id
            ELSE TRUE
        END
        AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_document_chunks(vector(1536), float, int, uuid) IS 'Performs similarity search on document chunks with optional document filtering';
