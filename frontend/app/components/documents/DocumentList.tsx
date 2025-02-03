'use client';

import { useState, useEffect } from 'react';
import { DocumentType } from '@/app/types/documents';
import { getSupabaseSession } from '@/app/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface Document {
  id: string;
  title: string;
  doc_type: DocumentType;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  version: number;
  is_active: boolean;
}

export default function DocumentList() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<DocumentType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created'>('updated');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    getSupabaseSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        if (!session) {
          throw new Error('Please sign in to view documents');
        }

        const response = await fetch(`/api/documents?type=${filter}&sort=${sortBy}`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }

        const data = await response.json();
        setDocuments(data.documents || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchDocuments();
    }
  }, [filter, sortBy, session]);

  const handleAddNewDocument = async () => {
    try {
      const currentSession = await getSupabaseSession();
      if (!currentSession) {
        setError('Please sign in to create documents');
        return;
      }
      router.push('/documents/new');
    } catch (err) {
      setError('Failed to navigate to new document page');
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as DocumentType | 'all')}
            className="px-3 pr-8 py-2 border rounded min-w-[160px] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="faq">FAQ</option>
            <option value="policy">Policy</option>
            <option value="help_article">Help Article</option>
            <option value="api_doc">API Documentation</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'updated' | 'created')}
            className="px-3 pr-8 py-2 border rounded min-w-[140px] dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          >
            <option value="updated">Last Updated</option>
            <option value="created">Created Date</option>
          </select>
        </div>
        <button
          onClick={handleAddNewDocument}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Add New Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded">
          <p className="text-gray-500 dark:text-gray-400">No documents found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 border rounded hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-800"
            >
              <h3 className="font-semibold mb-2 dark:text-white">{doc.title}</h3>
              <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <p>Type: {doc.doc_type}</p>
                <p>Version: {doc.version}</p>
                <p>Updated: {new Date(doc.updated_at).toLocaleDateString()}</p>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => router.push(`/documents/${doc.id}`)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  View
                </button>
                <button
                  onClick={() => router.push(`/documents/${doc.id}/edit`)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
