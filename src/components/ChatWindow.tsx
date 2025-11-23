import React, { useEffect, useRef } from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { Message } from '../types';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  hasError: boolean;
  errorMessage: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  onSendMessage,
  hasError,
  errorMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Asesor Financiero IA</h1>
        </div>
        <p className="text-blue-100">Consulta sobre inversiones, acciones y estrategias financieras</p>
      </div>

      {hasError && (
        <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900 font-semibold">Error</p>
            <p className="text-red-800 text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">Bienvenido al Asesor Financiero IA</p>
              <p className="text-gray-500">Comienza una conversación preguntando sobre inversiones, análisis de acciones o estrategias financieras.</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ))}
            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-emerald-600">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
                <div className="flex-1 max-w-lg">
                  <div className="inline-block px-4 py-2 rounded-lg bg-gray-100">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
};
