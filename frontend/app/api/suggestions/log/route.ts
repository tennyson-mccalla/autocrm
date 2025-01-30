import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headersList = headers();
    const authHeader = headersList.get('Authorization');

    console.log('Received auth header:', authHeader?.substring(0, 50) + '...');

    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Missing or invalid auth header format');
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Create a Supabase client with the access token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    );

    // Decode the JWT to get the user ID
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== 'object' || !decoded.sub) {
      console.error('Invalid token payload:', decoded);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('Token decoded successfully:', {
      userId: decoded.sub,
      email: decoded.email,
      role: decoded.role
    });

    // Insert log entry
    console.log('Attempting to insert log entry...');
    const { error } = await supabase
      .from('suggestions_log')
      .insert({
        ticket_id: body.ticketId,
        user_id: decoded.sub,
        original_suggestion: body.originalSuggestion,
        final_message: body.finalMessage,
        was_modified: body.wasModified,
        was_used: body.wasUsed,
        metadata: body.metadata
      });

    if (error) {
      console.error('Error inserting suggestion log:', error);
      throw error;
    }

    console.log('Successfully inserted log entry');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to log suggestion' },
      { status: 500 }
    );
  }
}
