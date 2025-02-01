'use client';

import { AIChat } from '@/app/components/AIChat';

export default function ChatPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">AI Assistant</h1>
      </div>
      <div className="h-[calc(100vh-12rem)]">
        <AIChat />
      </div>
    </div>
  );
}
