import React from 'react';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';

interface SidebarProps {
  sessions: Array<{ id: string; title: string }>;
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onNewChat}
          className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-shadow flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {sessions.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay conversaciones</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                  activeSessionId === session.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <div
                  onClick={() => onSelectSession(session.id)}
                  className="flex-1 truncate text-sm"
                >
                  {session.title}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-emerald-50">
        <p className="text-xs text-gray-600 text-center">
          Asesor Financiero IA
        </p>
      </div>
    </div>
  );
};
