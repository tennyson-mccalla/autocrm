'use client';

import { useState, useEffect } from 'react';
import { useRAG } from '@/app/hooks/useRAG';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { DocumentList } from '@/app/components/DocumentList';

interface Document {
  id: string;
  title: string;
  content: string;
  doc_type: 'faq' | 'policy' | 'help_article' | 'api_doc';
  metadata?: Record<string, any>;
  version?: number;
}

export default function KnowledgeBasePage() {
  const { addDocument, getStats, isLoading } = useRAG();
  const { toast } = useToast();
  const [stats, setStats] = useState<{
    totalDocuments: number;
    totalChunks: number;
    averageChunksPerDoc: number;
  } | null>(null);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [newDocument, setNewDocument] = useState<Omit<Document, 'id'>>({
    title: '',
    content: '',
    doc_type: 'faq',
  });

  const refreshStats = async () => {
    const newStats = await getStats();
    if (newStats) {
      setStats(newStats);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  const handleAddDocument = async () => {
    if (!newDocument.title.trim() || !newDocument.content.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsAddingDocument(true);
    try {
      const id = await addDocument(newDocument);
      if (id) {
        setNewDocument({
          title: '',
          content: '',
          doc_type: 'faq',
        });
        refreshStats();
      }
    } finally {
      setIsAddingDocument(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Knowledge Base Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newDocument.title}
                  onChange={e =>
                    setNewDocument(prev => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Document title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Document Type</Label>
                <Select
                  value={newDocument.doc_type}
                  onValueChange={value =>
                    setNewDocument(prev => ({
                      ...prev,
                      doc_type: value as Document['doc_type'],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="policy">Policy</SelectItem>
                    <SelectItem value="help_article">Help Article</SelectItem>
                    <SelectItem value="api_doc">API Documentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newDocument.content}
                  onChange={e =>
                    setNewDocument(prev => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  placeholder="Document content (supports Markdown)"
                  className="min-h-[200px]"
                />
              </div>
              <Button
                onClick={handleAddDocument}
                disabled={isAddingDocument}
                className="w-full"
              >
                {isAddingDocument ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Add Document'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {stats && (
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="text-lg font-semibold">Total Documents</h3>
              <p className="text-3xl font-bold">{stats.totalDocuments}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Total Chunks</h3>
              <p className="text-3xl font-bold">{stats.totalChunks}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Avg. Chunks/Doc</h3>
              <p className="text-3xl font-bold">
                {stats.averageChunksPerDoc.toFixed(1)}
              </p>
            </div>
          </div>
        </Card>
      )}

      <DocumentList />
    </div>
  );
}
