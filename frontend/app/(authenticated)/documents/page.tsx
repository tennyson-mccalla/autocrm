'use client';

import DocumentList from '@/app/components/documents/DocumentList';

export default function DocumentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Knowledge Base Documents</h1>
      </div>
      <DocumentList />
    </div>
  );
}
