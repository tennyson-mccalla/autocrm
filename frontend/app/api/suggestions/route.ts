import { NextResponse } from 'next/server';
import { suggestResponse } from '@/app/services/llm-service';
import { SuggestionRequest } from '@/app/types/llm-responses';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.ticketData || !body.ticketData.title || !body.ticketData.description) {
      return NextResponse.json(
        { error: 'Invalid request: Missing required ticket data' },
        { status: 400 }
      );
    }

    const suggestionRequest: SuggestionRequest = {
      ticketData: body.ticketData,
      style: body.style,
    };

    const response = await suggestResponse(suggestionRequest);

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in suggestions API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
