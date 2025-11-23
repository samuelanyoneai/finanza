import React, { useState } from 'react';
import { Send, Loader } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pregunta sobre inversiones, acciones, estrategias financieras..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
