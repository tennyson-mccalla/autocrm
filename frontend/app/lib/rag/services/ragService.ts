import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { processDocument as processDocumentUtil, findSimilarChunks } from '../utils/documentProcessor';

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
    },
  }
);

interface Document {
  id: string;
  title: string;
  content: string;
  doc_type: 'faq' | 'policy' | 'help_article' | 'api_doc';
  metadata?: Record<string, any>;
  version?: number;
}

interface DocumentChunk {
  content: string;
  similarity: number;
  document_id: string;
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

export class RAGService {
  /**
   * Process a document to create chunks and embeddings
   */
  static async processDocument(doc: Document): Promise<void> {
    console.log('RAG Service: Processing document:', doc.id);

    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key is not configured');
      }

      // Delete existing chunks for this document
      const { error: deleteError } = await supabase
        .from('document_chunks')
        .delete()
        .eq('document_id', doc.id);

      if (deleteError) {
        console.error('Error deleting existing chunks:', deleteError);
        throw deleteError;
      }

      // Process the document
      await processDocumentUtil(
        doc.id,
        doc.content,
        doc.metadata || {}
      );

      console.log('RAG Service: Document processed successfully');
    } catch (err) {
      console.error('RAG Service: Error processing document:', err);
      throw err;
    }
  }

  /**
   * Add a new document to the knowledge base
   */
  static async addDocument(doc: Document): Promise<string> {
    // Insert document into database
    const { data, error } = await supabase
      .from('documents')
      .insert({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        doc_type: doc.doc_type,
        metadata: doc.metadata || {},
        version: doc.version || 1
      })
      .select()
      .single();

    if (error) throw error;

    // Process document to create chunks and embeddings
    await processDocumentUtil(
      data.id,
      doc.content,
      doc.metadata || {}
    );

    return data.id;
  }

  /**
   * Update an existing document
   */
  static async updateDocument(id: string, updates: Partial<Document>): Promise<void> {
    // Update document in database
    const { error } = await supabase
      .from('documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;

    // If content was updated, reprocess document
    if (updates.content) {
      const { data: doc } = await supabase
        .from('documents')
        .select()
        .eq('id', id)
        .single();

      if (doc) {
        await processDocumentUtil(
          id,
          updates.content,
          { ...doc.metadata, ...updates.metadata }
        );
      }
    }
  }

  /**
   * Delete a document and its chunks
   */
  static async deleteDocument(id: string): Promise<void> {
    // Delete document chunks first (foreign key constraint)
    const { error: chunksError } = await supabase
      .from('document_chunks')
      .delete()
      .eq('document_id', id);

    if (chunksError) throw chunksError;

    // Delete document
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Query the knowledge base
   */
  static async query(
    query: string,
    options: {
      maxChunks?: number;
      similarityThreshold?: number;
      temperature?: number;
      documentId?: string;
    } = {}
  ): Promise<QueryResult> {
    const {
      maxChunks = 5,
      similarityThreshold = 0.7,
      temperature = 0.7,
      documentId
    } = options;

    // Find similar chunks
    const chunks = await findSimilarChunks(query, {
      maxChunks,
      similarityThreshold,
      documentId
    });

    const relevantChunks = chunks.map(chunk => ({
      content: chunk.content,
      similarity: chunk.similarity,
      documentId: chunk.document_id
    }));

    if (relevantChunks.length === 0) {
      return {
        answer: "I couldn't find any relevant information to answer your question.",
        relevantChunks: [],
        confidence: 0
      };
    }

    // Construct prompt with context
    const context = relevantChunks
      .map(chunk => chunk.content)
      .join('\n\n');

    const prompt = `Based on the following context, please answer the question. Provide your answer along with citations. After your answer, include a 'Citations:' section listing source identifiers (e.g., document IDs or chunk numbers) for the referenced information. If you cannot answer based solely on the context, simply state that.

Context:
${context}

Question: ${query}

Answer:`;

    // Generate answer using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that answers questions based on the provided context. Only use the information from the context to answer questions. If you cannot answer a question based solely on the context, say so.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: temperature
    });

    const answer = completion.choices[0].message.content || "I couldn't generate an answer.";

    // Calculate confidence based on chunk similarities
    const confidence = relevantChunks.reduce((sum, chunk) => sum + chunk.similarity, 0) / relevantChunks.length;

    return {
      answer,
      relevantChunks,
      confidence
    };
  }

  /**
   * Get statistics about the knowledge base
   */
  static async getStats(): Promise<{
    totalDocuments: number;
    totalChunks: number;
    averageChunksPerDoc: number;
  }> {
    const { count: totalDocuments } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });

    const { count: totalChunks } = await supabase
      .from('document_chunks')
      .select('*', { count: 'exact', head: true });

    return {
      totalDocuments: totalDocuments || 0,
      totalChunks: totalChunks || 0,
      averageChunksPerDoc: totalDocuments ? (totalChunks || 0) / totalDocuments : 0
    };
  }
}
