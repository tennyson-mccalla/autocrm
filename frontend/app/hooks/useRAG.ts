import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface Document {
  id: string;
  title: string;
  content: string;
  doc_type: 'faq' | 'policy' | 'help_article' | 'api_doc';
  metadata?: Record<string, any>;
  version?: number;
}

interface QueryResult {
  answer: string;
  relevantChunks: Array<{
    content: string;
    similarity: number;
    documentId: string;
  }>;
  confidence: number;
}

interface QueryOptions {
  maxChunks?: number;
  similarityThreshold?: number;
  temperature?: number;
}

interface Stats {
  totalDocuments: number;
  totalChunks: number;
  averageChunksPerDoc: number;
}

export function useRAG() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleError = (error: any) => {
    console.error('RAG Error:', error);
    toast({
      title: 'Error',
      description: error.message || 'An error occurred',
      variant: 'destructive',
    });
  };

  const query = async (
    question: string,
    options?: QueryOptions
  ): Promise<QueryResult | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'query',
          question,
          options,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to query knowledge base');
      }

      return await response.json();
    } catch (error: any) {
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const addDocument = async (document: Omit<Document, 'id'>): Promise<string | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addDocument',
          document,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add document');
      }

      const { id } = await response.json();
      toast({
        title: 'Success',
        description: 'Document added successfully',
      });
      return id;
    } catch (error: any) {
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateDocument = async (
    id: string,
    updates: Partial<Document>
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateDocument',
          id,
          updates,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update document');
      }

      toast({
        title: 'Success',
        description: 'Document updated successfully',
      });
      return true;
    } catch (error: any) {
      handleError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDocument = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteDocument',
          id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete document');
      }

      toast({
        title: 'Success',
        description: 'Document deleted successfully',
      });
      return true;
    } catch (error: any) {
      handleError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getStats = async (): Promise<Stats | null> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getStats',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get stats');
      }

      return await response.json();
    } catch (error: any) {
      handleError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    query,
    addDocument,
    updateDocument,
    deleteDocument,
    getStats,
    isLoading,
  };
}
