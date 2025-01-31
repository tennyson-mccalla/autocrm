'use client';

import DocumentForm from '@/app/components/documents/DocumentForm';

export default function NewDocumentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Add New Document</h1>
        <DocumentForm />
      </div>
    </div>
  );
}
