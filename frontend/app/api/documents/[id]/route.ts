import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import { Database } from '@/types/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching document with ID:', params.id);

    // Get the authorization header
    const headersList = headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      console.error('No authorization header');
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false
        }
      }
    );

    // Verify the JWT token
    const token = authorization.replace('Bearer ', '');
    const { data: { user }, error: verifyError } = await supabase.auth.getUser(token);

    if (verifyError || !user) {
      console.error('Token verification error:', verifyError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('User authenticated, fetching document...');

    // First, check if the document exists
    const { count, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('id', params.id);

    if (countError) {
      console.error('Error checking document existence:', countError);
      return NextResponse.json(
        { error: 'Failed to check document existence' },
        { status: 500 }
      );
    }

    if (count === 0) {
      console.log('Document not found');
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    if (count > 1) {
      console.error('Multiple documents found with the same ID');
      return NextResponse.json(
        { error: 'Data integrity error: Multiple documents with same ID' },
        { status: 500 }
      );
    }

    // Now fetch the single document
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Supabase error fetching document:', error);
      return NextResponse.json(
        { error: `Failed to fetch document: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Document found:', document.id);
    return NextResponse.json(document);
  } catch (err) {
    console.error('Unexpected error in document route:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Verify auth
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get request body
    const updates = await request.json();

    // Update document
    const { data: document, error } = await supabase
      .from('documents')
      .update({
        title: updates.title,
        content: updates.content,
        doc_type: updates.doc_type,
        metadata: updates.metadata,
        version: updates.version || 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating document:', error);
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }

    return NextResponse.json(document);
  } catch (err) {
    console.error('Error in document route:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Verify auth
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete document
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting document:', error);
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error in document route:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
