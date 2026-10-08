import React from 'react';
import { X, MessageSquare, Trash2, Plus } from 'lucide-react';
import { ChatSession } from '../types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewChat: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/25 backdrop-blur-xs">
      <div
        className="w-full max-w-xs sm:max-w-sm h-full bg-[#FAF9F5] border-l border-[#E5E3DC] p-5 shadow-2xl flex flex-col transition-transform animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#ECEAE3]">
          <h3 className="text-sm font-semibold text-[#18181B] font-bengali">
            আগের আড্ডাগুলো ({sessions.length})
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#71717A] hover:bg-[#EFECE5] hover:text-[#18181B] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New chat quick button */}
        <div className="py-3">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#006A4E]/30 bg-white px-3 py-2 text-xs font-medium text-[#006A4E] shadow-xs hover:bg-[#006A4E]/5 transition-colors font-bengali"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>নতুন আড্ডা শুরু করুন</span>
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto space-y-1.5 py-2 pr-1">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#A1A1A6] font-bengali">
              এখনও কোনো আগের আড্ডা নেই।
            </div>
          ) : (
            sessions.map((sess) => {
              const isActive = sess.id === activeSessionId;
              const dateStr = new Date(sess.updatedAt).toLocaleDateString('bn-BD', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={sess.id}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bengali transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-white border border-[#E0DED7] shadow-xs font-medium text-[#18181B]'
                      : 'hover:bg-[#F0EEE7] text-[#52525B]'
                  }`}
                  onClick={() => {
                    onSelectSession(sess.id);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2 overflow-hidden pr-2">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-[#71717A]" />
                    <div className="truncate">
                      <p className="truncate text-xs">{sess.title || 'নামহীন আলোচনা'}</p>
                      <span className="text-[10px] text-[#A1A1A6]">{dateStr}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(sess.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#A1A1A6] hover:text-red-600 transition-opacity"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
