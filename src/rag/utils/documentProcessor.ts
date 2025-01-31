import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { encode, decode as gptDecode } from 'gpt-tokenizer';

// Helper function to decode tokens back to text
function decode(tokens: number[]): string {
    return gptDecode(tokens);
}

// Types
export type DocumentType = 'faq' | 'policy' | 'help_article' | 'api_doc';

interface Document {
    id?: string;
    title: string;
    content: string;
    doc_type: DocumentType;
    metadata?: Record<string, any>;
    version?: number;
    is_active?: boolean;
}

interface DocumentChunk {
    id?: string;
    document_id: string;
    chunk_index: number;
    content: string;
    token_count: number;
    embedding?: number[];
    metadata?: Record<string, any>;
}

interface BatchProcessResult {
    success: boolean;
    documentId?: string;
    error?: string;
}

interface DatabaseDocument extends Document {
    id: string;
    created_at: string;
    updated_at: string;
}

// Configuration
const CHUNK_SIZE = 500; // Target number of tokens per chunk
const CHUNK_OVERLAP = 50; // Number of tokens to overlap between chunks
const BATCH_CONCURRENCY = 3; // Number of documents to process concurrently

// Initialize clients lazily to ensure environment variables are loaded
let supabaseClient: SupabaseClient;
let openaiClient: OpenAI;

function getSupabase() {
    if (!supabaseClient) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !key) {
            throw new Error('Missing Supabase configuration. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
        }

        supabaseClient = createClient(url, key);
    }
    return supabaseClient;
}

function getOpenAI() {
    if (!openaiClient) {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            throw new Error('Missing OpenAI configuration. Ensure OPENAI_API_KEY is set.');
        }

        openaiClient = new OpenAI({ apiKey });
    }
    return openaiClient;
}

export class DocumentProcessor {
    /**
     * Splits text into chunks of approximately equal token length with overlap
     */
    private static chunkText(text: string): { chunks: string[]; tokenCounts: number[] } {
        const tokens = encode(text);
        const chunks: string[] = [];
        const tokenCounts: number[] = [];

        let currentChunk: number[] = [];
        let currentTokenCount = 0;

        for (let i = 0; i < tokens.length; i++) {
            currentChunk.push(tokens[i]);
            currentTokenCount++;

            // Check if we've reached target chunk size
            if (currentTokenCount >= CHUNK_SIZE) {
                // Find the last period or newline in the chunk for clean breaks
                let lastBreak = -1;
                for (let j = currentChunk.length - 1; j >= 0; j--) {
                    const token = currentChunk[j];
                    if (token === encode('.')[0] || token === encode('\n')[0]) {
                        lastBreak = j;
                        break;
                    }
                }

                // If we found a good break point, split there
                if (lastBreak !== -1) {
                    const chunkToAdd = currentChunk.slice(0, lastBreak + 1);
                    chunks.push(decode(chunkToAdd));
                    tokenCounts.push(chunkToAdd.length);

                    // Keep overlap tokens for next chunk
                    currentChunk = currentChunk.slice(
                        Math.max(0, lastBreak + 1 - CHUNK_OVERLAP)
                    );
                    currentTokenCount = currentChunk.length;
                } else {
                    // If no good break point, just split at target size
                    chunks.push(decode(currentChunk));
                    tokenCounts.push(currentChunk.length);
                    currentChunk = currentChunk.slice(
                        Math.max(0, currentChunk.length - CHUNK_OVERLAP)
                    );
                    currentTokenCount = currentChunk.length;
                }
            }
        }

        // Add any remaining text as final chunk
        if (currentChunk.length > 0) {
            chunks.push(decode(currentChunk));
            tokenCounts.push(currentChunk.length);
        }

        return { chunks, tokenCounts };
    }

    /**
     * Generates embeddings for text using OpenAI's API
     */
    private static async generateEmbedding(text: string): Promise<number[]> {
        const openai = getOpenAI();
        const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: text,
        });

        return response.data[0].embedding;
    }

    /**
     * Processes and stores a new document, handling versioning
     */
    public static async processDocument(doc: Document): Promise<string> {
        try {
            const supabase = getSupabase();

            // Start transaction
            const { data: existingDocs, error: selectError } = await supabase
                .from('documents')
                .select('version')
                .eq('title', doc.title)
                .eq('is_active', true);

            if (selectError) {
                throw new Error(`Failed to check for existing document: ${selectError.message}`);
            }

            // Set version based on existing active document if any
            const existingDoc = existingDocs?.[0];
            const version = existingDoc?.version ? (existingDoc.version + 1) : 1;

            // If existing doc exists, mark it as inactive
            if (existingDoc) {
                const { error: updateError } = await supabase
                    .from('documents')
                    .update({ is_active: false })
                    .eq('title', doc.title);

                if (updateError) {
                    throw new Error(`Failed to update existing document: ${updateError.message}`);
                }
            }

            // Insert new document
            const { data: newDoc, error: docError } = await supabase
                .from('documents')
                .insert({
                    ...doc,
                    version,
                    is_active: true,
                })
                .select()
                .single();

            if (docError) {
                throw new Error(`Failed to insert new document: ${docError.message}`);
            }
            if (!newDoc) {
                throw new Error('Failed to create document: No data returned');
            }

            // Process chunks
            const { chunks, tokenCounts } = this.chunkText(doc.content);
            console.log(`Generated ${chunks.length} chunks from document`);

            // Generate embeddings and store chunks
            const chunkPromises = chunks.map(async (chunk, index) => {
                try {
                    const embedding = await this.generateEmbedding(chunk);
                    console.log(`Generated embedding for chunk ${index + 1}/${chunks.length}`);

                    // Ensure metadata is properly formatted as JSONB
                    const processedMetadata = doc.metadata ?
                        (typeof doc.metadata === 'string' ? JSON.parse(doc.metadata) : doc.metadata) :
                        {};

                    // Format the data for insertion
                    const insertData = {
                        document_id: (newDoc as DatabaseDocument).id,
                        chunk_index: index,
                        content: chunk,
                        token_count: tokenCounts[index],
                        embedding: Array.from(embedding),
                        metadata: processedMetadata
                    };

                    console.log('Inserting chunk data:', {
                        document_id: insertData.document_id,
                        chunk_index: insertData.chunk_index,
                        content: insertData.content.substring(0, 50) + '...',  // Truncate for logging
                        token_count: insertData.token_count,
                        embedding: `[${embedding.slice(0, 3).map(n => n.toFixed(6))}...${embedding.slice(-3).map(n => n.toFixed(6))}]`,
                        metadata: insertData.metadata
                    });

                    // Insert directly into document_chunks table
                    const { error: insertError } = await supabase
                        .from('document_chunks')
                        .insert({
                            document_id: insertData.document_id,
                            chunk_index: insertData.chunk_index,
                            content: insertData.content,
                            token_count: insertData.token_count,
                            embedding: insertData.embedding,
                            metadata: insertData.metadata
                        });

                    if (insertError) {
                        console.error('Chunk insertion error details:', insertError);
                        throw new Error(`Failed to insert chunk ${index}: ${insertError.message}`);
                    }
                } catch (error) {
                    throw new Error(`Error processing chunk ${index}: ${error instanceof Error ? error.message : String(error)}`);
                }
            });

            await Promise.all(chunkPromises);
            console.log('All chunks processed successfully');

            return (newDoc as DatabaseDocument).id;
        } catch (error) {
            console.error('Error processing document:', error instanceof Error ? error.message : String(error));
            throw error;
        }
    }

    /**
     * Updates an existing document while maintaining version history
     */
    public static async updateDocument(id: string, updates: Partial<Document>): Promise<void> {
        try {
            const supabase = getSupabase();
            const { data: existingDoc } = await supabase
                .from('documents')
                .select('*')
                .eq('id', id)
                .single();

            if (!existingDoc) {
                throw new Error('Document not found');
            }

            // Create new version with updates
            await this.processDocument({
                ...(existingDoc as DatabaseDocument),
                ...updates,
                title: (existingDoc as DatabaseDocument).title, // Ensure required fields
                content: (existingDoc as DatabaseDocument).content,
                doc_type: (existingDoc as DatabaseDocument).doc_type,
            });
        } catch (error) {
            console.error('Error updating document:', error);
            throw error;
        }
    }

    /**
     * Process multiple documents concurrently with rate limiting
     */
    public static async batchProcessDocuments(
        documents: Document[],
        options: { concurrency?: number; onProgress?: (completed: number, total: number) => void } = {}
    ): Promise<Record<string, BatchProcessResult>> {
        const results: Record<string, BatchProcessResult> = {};
        const concurrency = options.concurrency || BATCH_CONCURRENCY;
        let completed = 0;

        // Process documents in chunks to avoid overwhelming the API
        for (let i = 0; i < documents.length; i += concurrency) {
            const batch = documents.slice(i, i + concurrency);
            const batchPromises = batch.map(async (doc) => {
                try {
                    const docId = await this.processDocument(doc);
                    results[doc.title] = { success: true, documentId: docId };
                } catch (error) {
                    results[doc.title] = {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    };
                }

                completed++;
                options.onProgress?.(completed, documents.length);
            });

            // Wait for current batch to complete before processing next batch
            await Promise.all(batchPromises);

            // Add a small delay between batches to avoid rate limits
            if (i + concurrency < documents.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return results;
    }

    /**
     * Reprocess all active documents (useful for updating embeddings or chunking strategy)
     */
    public static async reprocessAllDocuments(
        options: {
            docType?: DocumentType;
            onProgress?: (completed: number, total: number) => void
        } = {}
    ): Promise<Record<string, BatchProcessResult>> {
        try {
            const supabase = getSupabase();
            const query = supabase
                .from('documents')
                .select('*')
                .eq('is_active', true);

            if (options.docType) {
                query.eq('doc_type', options.docType);
            }

            const { data: documents, error } = await query;

            if (error) throw error;
            if (!documents?.length) return {};

            // Reprocess all documents
            return this.batchProcessDocuments(
                documents.map(doc => ({
                    title: doc.title,
                    content: doc.content,
                    doc_type: doc.doc_type,
                    metadata: doc.metadata,
                    version: doc.version,
                    is_active: doc.is_active,
                } as Document)),
                {
                    onProgress: options.onProgress
                }
            );
        } catch (error) {
            console.error('Error reprocessing documents:', error);
            throw error;
        }
    }

    /**
     * Utility method to get processing stats
     */
    public static async getProcessingStats(): Promise<{
        totalDocuments: number;
        totalChunks: number;
        averageChunksPerDoc: number;
        docTypeBreakdown: Record<DocumentType, number>;
    }> {
        const supabase = getSupabase();
        const { data: documents, error: docError } = await supabase
            .from('documents')
            .select('id, doc_type')
            .eq('is_active', true);

        const { count: chunkCount, error: chunkError } = await supabase
            .from('document_chunks')
            .select('*', { count: 'exact' });

        if (docError || chunkError) throw docError || chunkError;

        // Initialize breakdown with all possible types set to 0
        const docTypeBreakdown: Record<DocumentType, number> = {
            faq: 0,
            policy: 0,
            help_article: 0,
            api_doc: 0
        };

        // Count documents by type
        documents?.forEach(doc => {
            const docType = (doc as { doc_type: DocumentType }).doc_type;
            if (docType in docTypeBreakdown) {
                docTypeBreakdown[docType]++;
            }
        });

        return {
            totalDocuments: documents?.length || 0,
            totalChunks: chunkCount || 0,
            averageChunksPerDoc: documents?.length ? (chunkCount || 0) / documents.length : 0,
            docTypeBreakdown
        };
    }
}
