'use client';

import { useState, useEffect } from 'react';
import { DocumentType } from '@/types/documents';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { supabase, getCurrentSession } from '@/app/lib/supabase';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface DocumentFormProps {
  initialData?: {
    id?: string;
    title: string;
    content: string;
    doc_type: DocumentType;
    metadata: Record<string, any>;
  };
}

export default function DocumentForm({ initialData }: DocumentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    doc_type: initialData?.doc_type || 'help_article' as DocumentType,
    metadata: initialData?.metadata || {}
  });

  useEffect(() => {
    // Get initial session
    getCurrentSession().then(session => {
      if (!session) {
        router.push('/login');
        return;
      }
      setSession(session);
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!session) {
        throw new Error('Please sign in to create or edit documents');
      }

      const response = await fetch(`/api/documents${initialData?.id ? `/${initialData.id}` : ''}`, {
        method: initialData?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(initialData?.id ? { ...formData, id: initialData.id } : formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save document');
      }

      router.push('/documents');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save document');
    } finally {
      setLoading(false);
    }
  };

  const handleMetadataChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [key]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2 dark:text-white">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 dark:text-white">Document Type</label>
        <select
          value={formData.doc_type}
          onChange={(e) => setFormData((prev) => ({ ...prev, doc_type: e.target.value as DocumentType }))}
          className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <option value="faq">FAQ</option>
          <option value="policy">Policy</option>
          <option value="help_article">Help Article</option>
          <option value="api_doc">API Documentation</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 dark:text-white">Content (Markdown)</label>
        <div data-color-mode="light" className="dark:hidden">
          <MDEditor
            value={formData.content}
            onChange={(value) => setFormData((prev) => ({ ...prev, content: value || '' }))}
            height={400}
          />
        </div>
        <div data-color-mode="dark" className="hidden dark:block">
          <MDEditor
            value={formData.content}
            onChange={(value) => setFormData((prev) => ({ ...prev, content: value || '' }))}
            height={400}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 dark:text-white">Metadata</label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.metadata.department || ''}
              onChange={(e) => handleMetadataChange('department', e.target.value)}
              placeholder="Department"
              className="flex-1 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <input
              type="text"
              value={formData.metadata.tags || ''}
              onChange={(e) => handleMetadataChange('tags', e.target.value)}
              placeholder="Tags (comma-separated)"
              className="flex-1 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <input
            type="text"
            value={formData.metadata.last_reviewed || ''}
            onChange={(e) => handleMetadataChange('last_reviewed', e.target.value)}
            placeholder="Last Reviewed (YYYY-MM-DD)"
            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 text-white rounded ${
            loading
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          }`}
        >
          {loading ? 'Saving...' : initialData ? 'Update Document' : 'Create Document'}
        </button>
      </div>
    </form>
  );
}
