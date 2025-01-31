export type DocumentType = 'faq' | 'policy' | 'help_article' | 'api_doc';

export interface Document {
  id: string;
  title: string;
  content: string;
  doc_type: DocumentType;
  metadata: Record<string, any>;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  token_count: number;
  embedding: number[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
