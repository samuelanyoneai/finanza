import React from 'react';
import { Bot } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-emerald-600'
      }`}>
        {isUser ? (
          <span className="text-white text-sm font-semibold">U</span>
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>
      <div className={`flex-1 max-w-lg ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </div>
  );
};
