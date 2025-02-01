'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentSession } from '@/app/lib/supabase';
import dynamic from 'next/dynamic';
import '@/app/styles/markdown.css';

// Custom styles for markdown viewer
const markdownStyles = {
  light: `
    .wmde-markdown {
      background-color: transparent;
    }
  `,
  dark: `
    .wmde-markdown {
      background-color: transparent;
      color: #e5e7eb;
    }
    .wmde-markdown h1,
    .wmde-markdown h2,
    .wmde-markdown h3,
    .wmde-markdown h4,
    .wmde-markdown h5,
    .wmde-markdown h6 {
      color: #f3f4f6;
      border-bottom-color: #374151;
    }
    .wmde-markdown code {
      background-color: #374151;
      color: #e5e7eb;
    }
    .wmde-markdown table {
      border-color: #374151;
    }
    .wmde-markdown table tr {
      background-color: transparent;
      border-top-color: #374151;
    }
    .wmde-markdown table tr:nth-child(2n) {
      background-color: #1f2937;
    }
    .wmde-markdown table th,
    .wmde-markdown table td {
      border-color: #374151;
    }
    .wmde-markdown blockquote {
      color: #9ca3af;
      border-left-color: #374151;
    }
    .wmde-markdown hr {
      background-color: #374151;
    }
    .wmde-markdown a {
      color: #60a5fa;
    }
    .wmde-markdown a:hover {
      color: #93c5fd;
    }
  `
};

const MDViewer = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => ({
    default: function MarkdownViewer({ content }: { content: string }) {
      return <mod.default.Markdown source={content} />;
    }
  })),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    )
  }
);

interface Document {
  id: string;
  title: string;
  content: string;
  doc_type: string;
  metadata: Record<string, any>;
  version: number;
  created_at: string;
  updated_at: string;
}

interface RAGPreviewResult {
  answer: string;
  relevantChunks: Array<{
    content: string;
    similarity: number;
    documentId: string;
  }>;
  confidence: number;
}

export default function DocumentViewPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [testQuery, setTestQuery] = useState('');
  const [previewResult, setPreviewResult] = useState<RAGPreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const initSession = async () => {
      const currentSession = await getCurrentSession();
      if (!currentSession) {
        router.push('/login');
        return;
      }
      setSession(currentSession);
    };

    initSession();
  }, [router]);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!session?.access_token) {
        console.log('No access token available, skipping fetch');
        return;
      }

      try {
        console.log('Fetching document:', params.id);
        const response = await fetch(`/api/documents/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('API error:', data);
          throw new Error(data.error || 'Failed to fetch document');
        }

        console.log('Document fetched successfully');
        setDocument(data);
      } catch (err) {
        console.error('Error in fetchDocument:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch document');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchDocument();
    }
  }, [params.id, session]);

  const handleTestQuery = async () => {
    if (!testQuery.trim() || !session?.access_token) return;

    setPreviewLoading(true);
    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'query',
          query: testQuery,
          documentId: params.id // Optional: to test specific document
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to generate preview');
      }

      const result = await response.json();
      setPreviewResult(result);
    } catch (err) {
      console.error('Preview error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleProcessDocument = async () => {
    if (!session?.access_token) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'processDocument',
          documentId: params.id
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to process document');
      }

      const result = await response.json();
      if (result.success) {
        // Clear any existing preview results
        setPreviewResult(null);
      }
    } catch (err) {
      console.error('Process error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process document');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">{document.title}</h1>
        <div className="space-x-2">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Back
          </button>
          <button
            onClick={handleProcessDocument}
            disabled={processing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
          >
            {processing ? 'Processing...' : 'Process Document'}
          </button>
          <button
            onClick={() => router.push(`/documents/${params.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <div>Type: {document.doc_type}</div>
            <div>Version: {document.version}</div>
          </div>

          <div className="border-t dark:border-gray-700 pt-4">
            <div data-color-mode="light" className="dark:hidden">
              <MDViewer content={document.content} />
            </div>
            <div data-color-mode="dark" className="hidden dark:block">
              <MDViewer content={document.content} />
            </div>
          </div>

          {Object.keys(document.metadata).length > 0 && (
            <div className="border-t dark:border-gray-700 pt-4 mt-4">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Metadata</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(document.metadata).map(([key, value]) => (
                  <div key={key} className="col-span-1">
                    <dt className="font-medium text-gray-500 dark:text-gray-400 capitalize">{key}</dt>
                    <dd className="text-gray-900 dark:text-gray-300">{value as string}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t dark:border-gray-700">
            <div>Created: {new Date(document.created_at).toLocaleString()}</div>
            <div>Last Updated: {new Date(document.updated_at).toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold dark:text-white">RAG Preview</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="testQuery" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Query
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="testQuery"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="Enter a test question..."
                  className="flex-1 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                  onClick={handleTestQuery}
                  disabled={previewLoading || !testQuery.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {previewLoading ? 'Testing...' : 'Test'}
                </button>
              </div>
            </div>

            {previewResult && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium dark:text-white mb-2">AI Response</h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="text-gray-900 dark:text-gray-100">{previewResult.answer}</p>
                  </div>
                  <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Confidence: {(previewResult.confidence * 100).toFixed(1)}%
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium dark:text-white mb-2">Relevant Chunks</h3>
                  <div className="space-y-2">
                    {previewResult.relevantChunks.map((chunk, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="text-sm text-gray-900 dark:text-gray-100">{chunk.content}</div>
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Relevance: {(chunk.similarity * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
