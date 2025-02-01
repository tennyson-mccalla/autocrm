import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '@/app/lib/rag/services/ragService';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * RAG API Route Handler
 * Required environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL: The URL of your Supabase project
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: The anon/public key of your Supabase project
 * - SUPABASE_SERVICE_ROLE_KEY: The service role key for admin operations
 */

// Helper to check if user has required permissions
async function checkPermissions(userId: string) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('Error getting user:', error);
    return false;
  }

  return user.user_metadata?.role === 'admin';
}

export async function POST(request: NextRequest) {
  console.log('RAG API: Received request');

  try {
    // Get the session
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('RAG API: Session error:', sessionError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session) {
      console.error('RAG API: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('RAG API: Session validated, processing request');

    const body = await request.json();
    console.log('RAG API: Request body:', body);

    const { action, query, documentId } = body;

    if (!action) {
      console.error('RAG API: Missing action in request');
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    switch (action) {
      case 'getStats':
        console.log('RAG API: Getting stats');
        const stats = await RAGService.getStats();
        return NextResponse.json(stats);

      case 'query':
        console.log('RAG API: Processing query:', { query, documentId });
        if (!query) {
          console.error('RAG API: Missing query parameter');
          return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        try {
          const result = await RAGService.query(query, {
            maxChunks: 5,
            similarityThreshold: 0.7,
            temperature: 0.7,
            documentId
          });
          console.log('RAG API: Query processed successfully');
          return NextResponse.json(result);
        } catch (queryError) {
          console.error('RAG API: Error processing query:', queryError);
          return NextResponse.json(
            { error: queryError instanceof Error ? queryError.message : 'Error processing query' },
            { status: 500 }
          );
        }

      case 'processDocument': {
        const hasPermission = await checkPermissions(session.user.id);
        if (!hasPermission) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }

        if (!documentId) {
          return NextResponse.json(
            { error: 'Document ID is required' },
            { status: 400 }
          );
        }

        console.log('RAG API: Processing document:', documentId);

        // Get the document
        const { data: document, error: docError } = await supabase
          .from('documents')
          .select('*')
          .eq('id', documentId)
          .single();

        if (docError || !document) {
          console.error('RAG API: Error fetching document:', docError);
          return NextResponse.json(
            { error: 'Document not found' },
            { status: 404 }
          );
        }

        try {
          await RAGService.processDocument(document);
          console.log('RAG API: Document processed successfully');
          return NextResponse.json({ success: true });
        } catch (processError) {
          console.error('RAG API: Error processing document:', processError);
          return NextResponse.json(
            { error: processError instanceof Error ? processError.message : 'Error processing document' },
            { status: 500 }
          );
        }
      }

      case 'addDocument': {
        const hasPermission = await checkPermissions(session.user.id);
        if (!hasPermission) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }

        const docId = await RAGService.addDocument(body.document);
        return NextResponse.json({ id: docId });
      }

      case 'updateDocument': {
        const hasPermission = await checkPermissions(session.user.id);
        if (!hasPermission) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }

        const { id, updates } = body;
        await RAGService.updateDocument(id, updates);
        return NextResponse.json({ success: true });
      }

      case 'deleteDocument': {
        const hasPermission = await checkPermissions(session.user.id);
        if (!hasPermission) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }

        const { id } = body;
        await RAGService.deleteDocument(id);
        return NextResponse.json({ success: true });
      }

      default:
        console.error('RAG API: Invalid action:', action);
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('RAG API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
