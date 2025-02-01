import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/components/ui/use-toast';
import { useRAG } from '@/app/hooks/useRAG';

interface Document {
  id: string;
  title: string;
  content: string;
  doc_type: 'faq' | 'policy' | 'help_article' | 'api_doc';
  metadata?: Record<string, any>;
  version?: number;
  created_at: string;
  updated_at: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const { updateDocument, deleteDocument } = useRAG();
  const { toast } = useToast();

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch documents',
        variant: 'destructive',
      });
      return;
    }

    setDocuments(data);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUpdateDocument = async () => {
    if (!selectedDoc) return;

    const success = await updateDocument(selectedDoc.id, {
      title: selectedDoc.title,
      content: selectedDoc.content,
      doc_type: selectedDoc.doc_type,
    });

    if (success) {
      setIsEditing(false);
      fetchDocuments();
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const success = await deleteDocument(id);
      if (success) {
        fetchDocuments();
      }
    }
  };

  const getDocTypeColor = (type: Document['doc_type']) => {
    switch (type) {
      case 'faq':
        return 'bg-blue-500';
      case 'policy':
        return 'bg-green-500';
      case 'help_article':
        return 'bg-purple-500';
      case 'api_doc':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map(doc => (
          <Card key={doc.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{doc.title}</h3>
                <Badge
                  className={`${getDocTypeColor(
                    doc.doc_type
                  )} text-white mt-1`}
                >
                  {doc.doc_type.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedDoc(doc);
                    setIsViewing(true);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedDoc(doc);
                    setIsEditing(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteDocument(doc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Last updated:{' '}
              {new Date(doc.updated_at).toLocaleDateString()}
            </p>
          </Card>
        ))}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewing} onOpenChange={setIsViewing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 prose dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap">{selectedDoc?.content}</pre>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={selectedDoc?.title}
                onChange={e =>
                  setSelectedDoc(prev =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Document Type</Label>
              <Select
                value={selectedDoc?.doc_type}
                onValueChange={value =>
                  setSelectedDoc(prev =>
                    prev
                      ? {
                          ...prev,
                          doc_type: value as Document['doc_type'],
                        }
                      : null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
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
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={selectedDoc?.content}
                onChange={e =>
                  setSelectedDoc(prev =>
                    prev ? { ...prev, content: e.target.value } : null
                  )
                }
                className="min-h-[200px]"
              />
            </div>
            <Button onClick={handleUpdateDocument} className="w-full">
              Update Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
