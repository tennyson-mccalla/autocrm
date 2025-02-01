import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export const testDocuments = [
  {
    title: 'Refund Policy',
    content: 'Our refund policy allows returns within 30 days of purchase. All items must be in original condition.',
    doc_type: 'policy' as const,
  },
  {
    title: 'API Rate Limits',
    content: 'Free tier: 1000 requests/day. Pro tier: 10000 requests/day. Enterprise tier: Custom limits.',
    doc_type: 'api_doc' as const,
  },
  {
    title: 'Common Issues FAQ',
    content: 'Q: How do I reset my password?\nA: Click the "Forgot Password" link on the login page.',
    doc_type: 'faq' as const,
  },
];

export const mockEmbedding = new Array(1536).fill(0).map(() => Math.random() * 2 - 1);

export function createTestClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );
}

export async function cleanupTestData(supabase: ReturnType<typeof createTestClient>) {
  // Delete test documents and their chunks
  const { error } = await supabase
    .from('documents')
    .delete()
    .in(
      'title',
      testDocuments.map(doc => doc.title)
    );

  if (error) {
    console.error('Error cleaning up test data:', error);
  }
}

export async function setupTestData(supabase: ReturnType<typeof createTestClient>) {
  // Clean up any existing test data
  await cleanupTestData(supabase);

  // Insert test documents
  const { error } = await supabase
    .from('documents')
    .insert(testDocuments);

  if (error) {
    console.error('Error setting up test data:', error);
    throw error;
  }
}

export function mockOpenAI() {
  return {
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
      }),
    },
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'This is a mock AI response based on the provided context.',
              },
            },
          ],
        }),
      },
    },
  };
}

export const mockChunks = [
  {
    content: 'First chunk of test content',
    similarity: 0.85,
    metadata: {},
    document_id: 'test-doc-1',
  },
  {
    content: 'Second chunk of test content',
    similarity: 0.75,
    metadata: {},
    document_id: 'test-doc-2',
  },
];
