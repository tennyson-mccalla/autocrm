import { POST } from '../route';
import { createTestClient, testDocuments, mockChunks } from '@/src/rag/tests/testUtils';
import { config, testQueries } from '@/src/rag/tests/testConfig';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { jest } from '@jest/globals';

// Mock the auth session
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

describe('RAG API Routes', () => {
  const mockSession = {
    user: { id: 'test-user-id' },
  };

  const mockSupabase = {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: mockSession } }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { role: 'admin' },
        error: null,
      }),
    }),
  };

  beforeEach(() => {
    (createRouteHandlerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('POST /api/rag', () => {
    it('should handle query action with various inputs', async () => {
      for (const question of [...testQueries.simple, ...testQueries.edge]) {
        const startTime = Date.now();
        const req = new Request('http://localhost/api/rag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'query',
            question,
            options: {
              maxChunks: 5,
              similarityThreshold: config.similarityThreshold,
            },
          }),
        });

        const response = await POST(req);
        const data = await response.json();

        // Performance check
        expect(Date.now() - startTime).toBeLessThan(config.timeoutMs);

        // Structure check
        expect(response.status).toBe(200);
        expect(data).toMatchObject({
          answer: expect.any(String),
          relevantChunks: expect.any(Array),
          confidence: expect.any(Number),
        });

        // Content checks for valid queries
        if (question.trim()) {
          expect(data.answer.length).toBeGreaterThan(10);
          expect(data.confidence).toBeGreaterThan(0.3);
        }
      }
    });

    it('should handle document management actions atomically', async () => {
      // Test document addition
      const addReq = new Request('http://localhost/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addDocument',
          document: testDocuments[0],
        }),
      });

      const addResponse = await POST(addReq);
      const { id: docId } = await addResponse.json();

      expect(addResponse.status).toBe(200);
      expect(docId).toMatch(/^[0-9a-f-]+$/); // UUID format

      // Test document update
      const updateReq = new Request('http://localhost/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateDocument',
          id: docId,
          updates: {
            title: 'Updated Title',
            content: 'Updated content',
          },
        }),
      });

      const updateResponse = await POST(updateReq);
      const updateData = await updateResponse.json();

      expect(updateResponse.status).toBe(200);
      expect(updateData.success).toBe(true);

      // Test document deletion
      const deleteReq = new Request('http://localhost/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteDocument',
          id: docId,
        }),
      });

      const deleteResponse = await POST(deleteReq);
      const deleteData = await deleteResponse.json();

      expect(deleteResponse.status).toBe(200);
      expect(deleteData.success).toBe(true);
    });

    it('should handle concurrent requests efficiently', async () => {
      const startTime = Date.now();
      const requests = Array(config.maxConcurrentRequests)
        .fill(0)
        .map(() =>
          POST(
            new Request('http://localhost/api/rag', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'query',
                question: testQueries.simple[0],
              }),
            })
          )
        );

      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(config.timeoutMs * config.maxConcurrentRequests);

      for (const response of responses) {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.answer).toBeTruthy();
      }
    });

    it('should handle authentication edge cases', async () => {
      const testCases = [
        {
          session: null,
          expectedStatus: 401,
          description: 'no session',
        },
        {
          session: { user: { id: 'expired-user' } },
          role: null,
          expectedStatus: 403,
          description: 'expired session',
        },
        {
          session: { user: { id: 'basic-user' } },
          role: 'user',
          expectedStatus: 403,
          description: 'insufficient permissions',
        },
      ];

      for (const testCase of testCases) {
        mockSupabase.auth.getSession.mockResolvedValueOnce({
          data: { session: testCase.session },
        });

        if (testCase.role !== undefined) {
          mockSupabase.from.mockReturnValueOnce({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { role: testCase.role },
              error: null,
            }),
          });
        }

        const req = new Request('http://localhost/api/rag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'addDocument',
            document: testDocuments[0],
          }),
        });

        const response = await POST(req);
        expect(response.status).toBe(testCase.expectedStatus);
      }
    });

    it('should handle malformed requests gracefully', async () => {
      const malformedRequests = [
        {
          body: {},
          expectedStatus: 400,
          description: 'empty body',
        },
        {
          body: { action: 'invalidAction' },
          expectedStatus: 400,
          description: 'invalid action',
        },
        {
          body: { action: 'query' },
          expectedStatus: 400,
          description: 'missing required fields',
        },
        {
          body: { action: 'addDocument', document: { invalid: 'structure' } },
          expectedStatus: 400,
          description: 'invalid document structure',
        },
      ];

      for (const { body, expectedStatus, description } of malformedRequests) {
        const req = new Request('http://localhost/api/rag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const response = await POST(req);
        expect(response.status).toBe(expectedStatus);

        const data = await response.json();
        expect(data.error).toBeTruthy();
      }
    });

    it('should maintain consistent response formats', async () => {
      const req = new Request('http://localhost/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getStats',
        }),
      });

      const response = await POST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        totalDocuments: expect.any(Number),
        totalChunks: expect.any(Number),
        averageChunksPerDoc: expect.any(Number),
      });

      // Numbers should be non-negative
      Object.values(data).forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
