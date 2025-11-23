import { useState, useCallback } from 'react';
import { ChatWindow } from './components/ChatWindow';
import { StockSearch } from './components/StockSearch';
import { supabase as supabaseClient, isSupabaseConfigured } from './lib/supabase';
import { sendMessage } from './lib/openai';
import type { Message, ChatSession } from './types';
import type { StockData } from './lib/alphavantage';

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString();
};

function App() {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const createLocalSession = useCallback((title = 'Nueva conversación') => {
    const newSession: ChatSession = {
      id: generateId(),
      title,
      createdAt: new Date(),
      messages: [],
    };

    setActiveSessionId(newSession.id);
    setMessages([]);
    return newSession;
  }, []);

  const createNewSession = useCallback(
    async (title = 'Nueva conversación') => {
      if (!supabaseClient) {
        return createLocalSession(title);
      }

      try {
        const { data, error } = await supabaseClient
          .from('chat_sessions')
          .insert([{ title }])
          .select()
          .single();

        if (error) throw error;

        const newSession: ChatSession = {
          id: data.id,
          title: data.title,
          createdAt: new Date(data.created_at),
          messages: [],
        };

        setActiveSessionId(newSession.id);
        setMessages([]);

        return newSession;
      } catch (error) {
        console.error('Error creando sesión:', error);
        setHasError(true);
        setErrorMessage('No se pudo crear una nueva conversación.');
        return null;
      }
    },
    [createLocalSession, supabaseClient]
  );

  const ensureSessionId = useCallback(async () => {
    if (activeSessionId) {
      return activeSessionId;
    }
    const session = await createNewSession();
    return session?.id ?? null;
  }, [activeSessionId, createNewSession]);

  const handleSendMessage = async (userMessage: string) => {
    const sessionId = await ensureSessionId();
    if (!sessionId) return;

    setHasError(false);
    setErrorMessage('');

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      let contextData: string | undefined;

      if (selectedStock) {
        contextData = `
Acción seleccionada: ${selectedStock.symbol}
Precio actual: $${selectedStock.price.toFixed(2)} ${selectedStock.currency}
Cambio: ${selectedStock.change >= 0 ? '+' : ''}${selectedStock.change.toFixed(2)} (${selectedStock.changePercent.toFixed(2)}%)
Datos obtenidos de: Alpha Vantage`;
      }

      const response = await sendMessage(
        updatedMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        contextData
      );

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);

      const sessionTitle = userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '');

      if (supabaseClient) {
        await supabaseClient.from('chat_messages').insert([
          {
            session_id: sessionId,
            role: 'user',
            content: userMessage,
          },
          {
            session_id: sessionId,
            role: 'assistant',
            content: response,
          },
        ]);

        await supabaseClient
          .from('chat_sessions')
          .update({ title: sessionTitle })
          .eq('id', sessionId);
      }

    } catch (error) {
      setHasError(true);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Error al conectar con la API. Verifica tu clave de OpenAI.'
      );
      setMessages(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <StockSearch onSelectStock={setSelectedStock} />
      {selectedStock && (
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 px-6 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">Acción seleccionada:</p>
              <p className="text-lg font-bold text-gray-900">{selectedStock.symbol}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-700">${selectedStock.price.toFixed(2)}</p>
              <p className={`text-sm font-semibold ${selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {selectedStock.change >= 0 ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}
      {!isSupabaseConfigured && (
        <div className="bg-yellow-50 border-b border-yellow-100 px-6 py-3 text-sm text-yellow-800">
          Supabase no está configurado. Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para guardar tus sesiones; por ahora solo
          vivirán mientras la página esté abierta.
        </div>
      )}
      <div className="flex-1 flex flex-col">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          hasError={hasError}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
}

export default App;
