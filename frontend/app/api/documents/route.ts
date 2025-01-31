import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const headersList = headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(
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
    const { data: { user }, error: verificationError } = await supabase.auth.getUser(token);

    if (verificationError || !user) {
      console.error('User verification error:', verificationError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Log the insert operation details
    console.log('Attempting to insert document:', {
      title: body.title,
      doc_type: body.doc_type,
      user_id: user.id,
      metadata: body.metadata
    });

    const { data, error } = await supabase
      .from('documents')
      .insert([{
        title: body.title,
        content: body.content,
        doc_type: body.doc_type,
        metadata: body.metadata,
        is_active: true,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, document: data });
  } catch (error) {
    console.error('Error creating document:', error);
    // Return more detailed error message
    return NextResponse.json(
      {
        error: 'Failed to create document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Get the authorization header
    const headersList = headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(
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
    const { data: { user }, error: verificationError } = await supabase.auth.getUser(token);

    if (verificationError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { error } = await supabase
      .from('documents')
      .update({
        title: body.title,
        content: body.content,
        doc_type: body.doc_type,
        metadata: body.metadata
      })
      .eq('id', body.id)
      .eq('user_id', user.id); // Only allow updating user's own documents

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const sort = searchParams.get('sort') || 'updated';

    console.log('GET /api/documents - Query params:', { type, sort });

    // Get the authorization header
    const headersList = headers();
    const authorization = headersList.get('authorization');

    if (!authorization) {
      console.log('GET /api/documents - No authorization header');
      return NextResponse.json(
        { error: 'No authorization header' },
        { status: 401 }
      );
    }

    const supabase = createClient(
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
    const { data: { user }, error: verificationError } = await supabase.auth.getUser(token);

    if (verificationError) {
      console.error('GET /api/documents - User verification error:', verificationError);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('GET /api/documents - No user found for token');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    console.log('GET /api/documents - Authenticated user:', user.id);

    // First check if the documents table exists
    const { error: tableError } = await supabase
      .from('documents')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('GET /api/documents - Table error:', tableError);
      return NextResponse.json(
        { error: 'Database table not found', details: tableError.message },
        { status: 500 }
      );
    }

    let query = supabase
      .from('documents')
      .select('*')
      .eq('is_active', true)
      .eq('user_id', user.id);

    if (type && type !== 'all') {
      query = query.eq('doc_type', type);
    }

    console.log('GET /api/documents - Executing query for user:', user.id);

    const { data, error } = await query.order(
      sort === 'updated' ? 'updated_at' : 'created_at',
      { ascending: false }
    );

    if (error) {
      console.error('GET /api/documents - Query error:', error);
      return NextResponse.json(
        { error: 'Database query failed', details: error.message },
        { status: 500 }
      );
    }

    console.log('GET /api/documents - Success, found', data?.length || 0, 'documents');
    return NextResponse.json({ documents: data || [] });
  } catch (error) {
    console.error('GET /api/documents - Unexpected error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
