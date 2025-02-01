import { splitIntoChunks, generateEmbedding, processDocument, findSimilarChunks } from '../utils/documentProcessor';
import { createTestClient, mockOpenAI, testDocuments, mockChunks } from './testUtils';
import { jest } from '@jest/globals';

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => mockOpenAI()),
}));

describe('Document Processor', () => {
  const supabase = createTestClient();

  describe('splitIntoChunks', () => {
    it('should split text into chunks of appropriate size', () => {
      const text = 'This is a test document. '.repeat(100); // Create a long document
      const chunks = splitIntoChunks(text, 100, 20);

      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach(chunk => {
        expect(chunk.tokenCount).toBeLessThanOrEqual(100);
      });
    });

    it('should handle overlap correctly', () => {
      const text = 'One two three four five six seven eight nine ten.';
      const chunks = splitIntoChunks(text, 20, 10);

      // Check that consecutive chunks have overlapping content
      for (let i = 1; i < chunks.length; i++) {
        const prevChunk = chunks[i - 1].content;
        const currentChunk = chunks[i].content;
        expect(prevChunk.slice(-10)).toBe(currentChunk.slice(0, 10));
      }
    });
  });

  describe('generateEmbedding', () => {
    it('should generate embedding of correct dimension', async () => {
      const text = 'Test document for embedding generation';
      const embedding = await generateEmbedding(text);

      expect(embedding).toHaveLength(1536); // OpenAI's embedding dimension
      embedding.forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('processDocument', () => {
    beforeEach(async () => {
      await supabase.from('document_chunks').delete().neq('id', '0');
    });

    it('should process document and store chunks with embeddings', async () => {
      const documentId = 'test-doc-123';
      const content = testDocuments[0].content;
      const metadata = { source: 'test' };

      await processDocument(documentId, content, metadata);

      const { data: chunks, error } = await supabase
        .from('document_chunks')
        .select('*')
        .eq('document_id', documentId);

      expect(error).toBeNull();
      expect(chunks).toBeDefined();
      expect(chunks!.length).toBeGreaterThan(0);

      chunks!.forEach(chunk => {
        expect(chunk.embedding).toBeDefined();
        expect(chunk.content).toBeDefined();
        expect(chunk.metadata).toMatchObject(metadata);
      });
    });
  });

  describe('findSimilarChunks', () => {
    beforeEach(async () => {
      // Mock the Supabase RPC call
      jest.spyOn(supabase, 'rpc').mockResolvedValue({
        data: mockChunks,
        error: null,
      });
    });

    it('should find similar chunks above threshold', async () => {
      const query = 'Test query';
      const chunks = await findSimilarChunks(query, 5, 0.7);

      expect(chunks).toHaveLength(2);
      chunks.forEach(chunk => {
        expect(chunk.similarity).toBeGreaterThanOrEqual(0.7);
        expect(chunk.content).toBeDefined();
        expect(chunk.metadata).toBeDefined();
      });
    });

    it('should respect the limit parameter', async () => {
      const query = 'Test query';
      const limit = 1;
      const chunks = await findSimilarChunks(query, limit, 0.7);

      expect(chunks).toHaveLength(1);
    });
  });
});
