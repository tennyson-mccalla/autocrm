import { useState } from 'react';
import { useRAG } from '@/app/hooks/useRAG';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    content: string;
    similarity: number;
  }>;
  confidence?: number;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { query, isLoading } = useRAG();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Get AI response
    const result = await query(input);
    if (result) {
      const aiMessage: Message = {
        role: 'assistant',
        content: result.answer,
        sources: result.relevantChunks.map(chunk => ({
          content: chunk.content,
          similarity: chunk.similarity,
        })),
        confidence: result.confidence,
      };
      setMessages(prev => [...prev, aiMessage]);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-4 space-y-4">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <Card
            key={index}
            className={`p-4 ${
              message.role === 'assistant'
                ? 'bg-primary/10'
                : 'bg-secondary/10'
            }`}
          >
            <div className="prose dark:prose-invert">
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>

            {message.sources && message.sources.length > 0 && (
              <Accordion type="single" collapsible className="mt-2">
                <AccordionItem value="sources">
                  <AccordionTrigger className="text-sm">
                    View Sources ({message.sources.length})
                    {message.confidence && (
                      <span className="ml-2 text-xs">
                        Confidence: {(message.confidence * 100).toFixed(1)}%
                      </span>
                    )}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {message.sources.map((source, idx) => (
                        <div
                          key={idx}
                          className="text-sm p-2 rounded bg-background/50"
                        >
                          <div className="font-mono text-xs mb-1">
                            Relevance: {(source.similarity * 100).toFixed(1)}%
                          </div>
                          <div className="whitespace-pre-wrap">
                            {source.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </Card>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 min-h-[80px]"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Send'
          )}
        </Button>
      </form>
    </div>
  );
}
