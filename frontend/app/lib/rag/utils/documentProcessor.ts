import { createClient } from '@supabase/supabase-js';
import { encode } from 'gpt-tokenizer';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;
const BATCH_SIZE = 3;

interface DocumentChunk {
  content: string;
  tokenCount: number;
  metadata: Record<string, any>;
  document_id: string;
  similarity: number;
}

/**
 * Split text into chunks based on sentences and paragraphs
 */
function splitIntoChunks(text: string): Array<{ content: string; metadata: Record<string, any>; tokenCount: number }> {
  const chunks: Array<{ content: string; metadata: Record<string, any>; tokenCount: number }> = [];

  // Split into paragraphs first
  const paragraphs = text.split(/\n\s*\n/);

  let currentChunk = '';
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    // Skip empty paragraphs
    if (!paragraph.trim()) continue;

    // Get token count for this paragraph
    const paragraphTokens = encode(paragraph).length;

    // If adding this paragraph would exceed chunk size, save current chunk and start new one
    if (currentTokens + paragraphTokens > CHUNK_SIZE && currentChunk) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: {},
        tokenCount: currentTokens
      });
      currentChunk = '';
      currentTokens = 0;
    }

    // Add paragraph to current chunk
    currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    currentTokens += paragraphTokens;

    // If current chunk is getting too big, save it
    if (currentTokens >= CHUNK_SIZE) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: {},
        tokenCount: currentTokens
      });
      currentChunk = '';
      currentTokens = 0;
    }
  }

  // Add any remaining content
  if (currentChunk) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: {},
      tokenCount: currentTokens
    });
  }

  return chunks;
}

/**
 * Generate embeddings for a chunk of text
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Process chunks in batches to avoid memory issues
 */
async function processBatch(
  chunks: Array<{ content: string; metadata: Record<string, any>; tokenCount: number }>,
  documentId: string,
  startIndex: number
): Promise<void> {
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkIndex = startIndex + i;

    try {
      // Generate embedding
      const embedding = await generateEmbedding(chunk.content);

      // Store chunk with embedding
      const { error } = await supabase
        .from('document_chunks')
        .insert({
          document_id: documentId,
          content: chunk.content,
          embedding,
          metadata: chunk.metadata,
          chunk_index: chunkIndex,
          token_count: chunk.tokenCount
        });

      if (error) {
        console.error(`Error storing chunk ${chunkIndex}:`, error);
        throw error;
      }

      console.log(`Processed chunk ${chunkIndex + 1}`);
    } catch (err) {
      console.error(`Error processing chunk ${chunkIndex}:`, err);
      throw err;
    }
  }
}

/**
 * Process a document and store its chunks with embeddings
 */
export async function processDocument(
  documentId: string,
  content: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  console.log('Processing document:', documentId);

  // Split content into chunks
  const chunks = splitIntoChunks(content).map(chunk => ({
    ...chunk,
    metadata: { ...metadata, ...chunk.metadata }
  }));

  console.log(`Created ${chunks.length} chunks`);

  // Process chunks in batches
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)}`);
    await processBatch(batch, documentId, i);

    // Add a small delay between batches to prevent memory buildup
    if (i + BATCH_SIZE < chunks.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('Document processing completed');
}

/**
 * Find chunks similar to a query using embeddings
 */
export async function findSimilarChunks(
  query: string,
  options: {
    maxChunks?: number;
    similarityThreshold?: number;
    documentId?: string;
  } = {}
): Promise<Array<{ content: string; similarity: number; document_id: string }>> {
  const {
    maxChunks = 5,
    similarityThreshold = 0.7,
    documentId
  } = options;

  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // Execute query
  const { data: matches, error } = await supabase.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    match_threshold: similarityThreshold,
    match_count: maxChunks,
    filter_document_id: documentId || null
  });

  if (error) {
    console.error('Error finding similar chunks:', error);
    throw error;
  }

  return matches.map((match: any) => ({
    content: match.content,
    similarity: match.similarity,
    document_id: match.document_id
  }));
}
