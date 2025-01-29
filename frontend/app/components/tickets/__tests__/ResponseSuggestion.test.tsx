import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResponseSuggestion from '../ResponseSuggestion';
import { TicketContext } from '@/app/types/llm-responses';

// Mock fetch globally
global.fetch = jest.fn();

const mockTicket: TicketContext = {
  id: '123',
  title: 'Test Ticket',
  description: 'Test Description',
  status: 'open',
  priority: 'high',
  customerEmail: 'test@example.com'
};

const mockOnSuggestionSelect = jest.fn();

describe('ResponseSuggestion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial state correctly', () => {
    render(
      <ResponseSuggestion
        ticket={mockTicket}
        onSuggestionSelect={mockOnSuggestionSelect}
      />
    );

    expect(screen.getByText('Response Suggestion')).toBeInTheDocument();
    expect(screen.getByText('Get AI Suggestion')).toBeInTheDocument();
    expect(screen.queryByText('Generating...')).not.toBeInTheDocument();
  });

  it('shows loading state when generating', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(
      <ResponseSuggestion
        ticket={mockTicket}
        onSuggestionSelect={mockOnSuggestionSelect}
      />
    );

    fireEvent.click(screen.getByText('Get AI Suggestion'));
    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });

  it('handles successful API response', async () => {
    const mockResponse = {
      suggestion: 'Test suggestion',
      metadata: {
        model: 'gpt-4',
        tokensUsed: 100,
        cost: 0.002
      }
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
    );

    render(
      <ResponseSuggestion
        ticket={mockTicket}
        onSuggestionSelect={mockOnSuggestionSelect}
      />
    );

    fireEvent.click(screen.getByText('Get AI Suggestion'));

    await waitFor(() => {
      expect(screen.getByText('Test suggestion')).toBeInTheDocument();
      expect(screen.getByText('Model: gpt-4')).toBeInTheDocument();
      expect(screen.getByText('Tokens: 100')).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    );

    render(
      <ResponseSuggestion
        ticket={mockTicket}
        onSuggestionSelect={mockOnSuggestionSelect}
      />
    );

    fireEvent.click(screen.getByText('Get AI Suggestion'));

    await waitFor(() => {
      expect(screen.getByText('Failed to get suggestion')).toBeInTheDocument();
    });
  });

  it('calls onSuggestionSelect when using suggestion', async () => {
    const mockResponse = {
      suggestion: 'Test suggestion',
      metadata: {
        model: 'gpt-4',
        tokensUsed: 100,
        cost: 0.002
      }
    };

    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })
    );

    render(
      <ResponseSuggestion
        ticket={mockTicket}
        onSuggestionSelect={mockOnSuggestionSelect}
      />
    );

    fireEvent.click(screen.getByText('Get AI Suggestion'));

    await waitFor(() => {
      fireEvent.click(screen.getByText('Use This Response'));
      expect(mockOnSuggestionSelect).toHaveBeenCalledWith('Test suggestion');
    });
  });
});
