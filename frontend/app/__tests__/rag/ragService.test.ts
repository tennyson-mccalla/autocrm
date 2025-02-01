import { RAGService } from '../services/ragService';
import { createTestClient, mockOpenAI, testDocuments, mockChunks } from './testUtils';
import { config, calculateStringSimilarity, testQueries } from './testConfig';
import { jest } from '@jest/globals';

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => mockOpenAI()),
}));

describe('RAG Service', () => {
  const supabase = createTestClient();

  beforeEach(async () => {
    // Clean up test data
    await supabase.from('documents').delete().neq('id', '0');
    await supabase.from('document_chunks').delete().neq('id', '0');
  });

  describe('addDocument', () => {
    it('should add a document and process it', async () => {
      const startTime = Date.now();
      const doc = testDocuments[0];
      const docId = await RAGService.addDocument(doc);

      // Performance check
      expect(Date.now() - startTime).toBeLessThan(config.timeoutMs);

      // Structural checks
      expect(docId).toMatch(/^[0-9a-f-]+$/); // UUID format

      // Verify document was added
      const { data: savedDoc, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', docId)
        .single();

      expect(error).toBeNull();
      expect(savedDoc).toMatchObject({
        title: doc.title,
        content: doc.content,
        doc_type: doc.doc_type,
      });

      // Verify chunks were created with proper structure
      const { data: chunks } = await supabase
        .from('document_chunks')
        .select('*')
        .eq('document_id', docId);

      expect(chunks).toBeDefined();
      expect(chunks!.length).toBeGreaterThan(0);
      chunks!.forEach(chunk => {
        expect(chunk).toMatchObject({
          document_id: docId,
          content: expect.any(String),
          token_count: expect.any(Number),
          embedding: expect.any(Array),
        });
        expect(chunk.token_count).toBeGreaterThanOrEqual(config.chunkSizeLimits.min);
        expect(chunk.token_count).toBeLessThanOrEqual(config.chunkSizeLimits.max);
      });
    });

    it('should handle large documents efficiently', async () => {
      const largeDoc = {
        title: 'Large Policy Document',
        content: 'Lorem ipsum '.repeat(1000),
        doc_type: 'policy' as const,
      };

      const startTime = Date.now();
      const docId = await RAGService.addDocument(largeDoc);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(config.timeoutMs * 2); // Allow extra time for large docs
      expect(docId).toBeDefined();
    });
  });

  describe('query', () => {
    beforeEach(() => {
      jest.spyOn(supabase, 'rpc').mockResolvedValue({
        data: mockChunks,
        error: null,
      });
    });

    it('should handle simple queries with semantic checking', async () => {
      for (const question of testQueries.simple) {
        const result = await RAGService.query(question);

        expect(result).toMatchObject({
          answer: expect.any(String),
          relevantChunks: expect.arrayContaining([
            expect.objectContaining({
              content: expect.any(String),
              similarity: expect.any(Number),
            }),
          ]),
          confidence: expect.any(Number),
        });

        // Semantic checks
        if (question.includes('refund')) {
          expect(result.answer.toLowerCase()).toMatch(/refund|return|money back/i);
        }
        if (question.includes('password')) {
          expect(result.answer.toLowerCase()).toMatch(/password|reset|login|account/i);
        }
        if (question.includes('API')) {
          expect(result.answer.toLowerCase()).toMatch(/api|limit|request|rate/i);
        }
      }
    });

    it('should handle edge cases gracefully', async () => {
      for (const query of testQueries.edge) {
        const startTime = Date.now();
        const result = await RAGService.query(query);

        // Should respond quickly for edge cases
        expect(Date.now() - startTime).toBeLessThan(config.timeoutMs);

        // Should always return a valid structure
        expect(result).toMatchObject({
          answer: expect.any(String),
          relevantChunks: expect.any(Array),
          confidence: expect.any(Number),
        });

        // Should have appropriate confidence for edge cases
        if (!query.trim()) {
          expect(result.confidence).toBeLessThan(0.3);
        }
      }
    });

    it('should maintain response consistency', async () => {
      const question = testQueries.simple[0];
      const results = await Promise.all(
        Array(3).fill(0).map(() => RAGService.query(question))
      );

      // Check semantic similarity between responses
      for (let i = 0; i < results.length; i++) {
        for (let j = i + 1; j < results.length; j++) {
          const similarity = calculateStringSimilarity(
            results[i].answer,
            results[j].answer
          );
          expect(similarity).toBeGreaterThan(0.7);
        }
      }
    });

    it('should handle concurrent requests efficiently', async () => {
      const startTime = Date.now();
      const results = await Promise.all(
        Array(config.maxConcurrentRequests)
          .fill(0)
          .map(() => RAGService.query(testQueries.simple[0]))
      );

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(config.timeoutMs * config.maxConcurrentRequests);

      results.forEach(result => {
        expect(result.answer).toBeTruthy();
        expect(result.confidence).toBeGreaterThan(config.similarityThreshold);
      });
    });

    it('should handle conversation context', async () => {
      let context = '';
      for (const question of testQueries.conversation) {
        const result = await RAGService.query(question, { context });
        context += `Q: ${question}\nA: ${result.answer}\n`;

        expect(result.answer).toBeTruthy();
        expect(result.confidence).toBeGreaterThan(config.similarityThreshold);

        // Check for conversation coherence
        if (context.length > 0) {
          const hasContextualReference = result.answer.match(/previous|mentioned|above|earlier/i);
          expect(hasContextualReference).toBeTruthy();
        }
      }
    });
  });

  describe('updateDocument', () => {
    it('should update document and maintain data integrity', async () => {
      // First add a document
      const doc = testDocuments[0];
      const docId = await RAGService.addDocument(doc);

      // Get original chunks
      const { data: originalChunks } = await supabase
        .from('document_chunks')
        .select('*')
        .eq('document_id', docId);

      // Update the document
      const updates = {
        title: 'Updated Title',
        content: 'Updated content for testing',
      };

      const startTime = Date.now();
      await RAGService.updateDocument(docId, updates);
      expect(Date.now() - startTime).toBeLessThan(config.timeoutMs);

      // Verify document was updated
      const { data: updatedDoc } = await supabase
        .from('documents')
        .select('*')
        .eq('id', docId)
        .single();

      expect(updatedDoc).toMatchObject({
        id: docId,
        ...updates,
        version: 2,
      });

      // Verify chunks were properly reprocessed
      const { data: newChunks } = await supabase
        .from('document_chunks')
        .select('*')
        .eq('document_id', docId);

      expect(newChunks).toBeDefined();
      expect(newChunks!.length).toBeGreaterThan(0);

      // Verify old chunks were replaced
      const chunkIds = new Set(newChunks!.map(c => c.id));
      originalChunks!.forEach(oldChunk => {
        expect(chunkIds.has(oldChunk.id)).toBeFalsy();
      });
    });
  });

  describe('deleteDocument', () => {
    it('should delete document and ensure cleanup', async () => {
      const doc = testDocuments[0];
      const docId = await RAGService.addDocument(doc);

      const startTime = Date.now();
      await RAGService.deleteDocument(docId);
      expect(Date.now() - startTime).toBeLessThan(config.timeoutMs);

      // Verify complete deletion
      const { data: deletedDoc } = await supabase
        .from('documents')
        .select('*')
        .eq('id', docId);
      expect(deletedDoc).toHaveLength(0);

      const { data: chunks } = await supabase
        .from('document_chunks')
        .select('*')
        .eq('document_id', docId);
      expect(chunks).toHaveLength(0);

      // Verify no orphaned data
      const { data: allChunks } = await supabase
        .from('document_chunks')
        .select('document_id');
      allChunks!.forEach(chunk => {
        expect(chunk.document_id).not.toBe(docId);
      });
    });
  });

  describe('getStats', () => {
    it('should return accurate and consistent statistics', async () => {
      // Add test documents
      await Promise.all(testDocuments.map(doc => RAGService.addDocument(doc)));

      const stats = await RAGService.getStats();

      expect(stats).toMatchObject({
        totalDocuments: testDocuments.length,
        totalChunks: expect.any(Number),
        averageChunksPerDoc: expect.any(Number),
      });

      // Verify statistical consistency
      expect(stats.totalChunks).toBeGreaterThan(0);
      expect(stats.averageChunksPerDoc).toBeGreaterThan(0);
      expect(stats.averageChunksPerDoc).toBe(stats.totalChunks / stats.totalDocuments);

      // Verify performance
      const startTime = Date.now();
      const stats2 = await RAGService.getStats();
      expect(Date.now() - startTime).toBeLessThan(config.timeoutMs);
      expect(stats2).toEqual(stats);
    });
  });
});
