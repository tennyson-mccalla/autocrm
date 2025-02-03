export interface Document {
  id: string;
  title: string;
  content: string;
  doc_type: 'faq' | 'policy' | 'help_article' | 'api_doc';
  metadata?: Record<string, any>;
  version?: number;
}

interface ApiResponse {
  success?: boolean;
  id?: string;
  error?: string;
}

async function callRagApi(payload: Record<string, any>): Promise<ApiResponse> {
  try {
    const response = await fetch('/api/rag', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function processDocumentClient(doc: Document): Promise<ApiResponse> {
  return callRagApi({ action: 'processDocument', doc });
}

export async function addDocumentClient(doc: Document): Promise<ApiResponse> {
  return callRagApi({ action: 'addDocument', doc });
}

export async function updateDocumentClient(documentId: string, updates: Partial<Document>): Promise<ApiResponse> {
  return callRagApi({ action: 'updateDocument', documentId, updates });
}

export async function deleteDocumentClient(documentId: string): Promise<ApiResponse> {
  return callRagApi({ action: 'deleteDocument', documentId });
}
