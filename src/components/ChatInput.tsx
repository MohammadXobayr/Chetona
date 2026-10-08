import React, { useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: (text: string) => void;
  isLoading: boolean;
  onStop?: () => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  onSend,
  isLoading,
  onStop,
  placeholder = 'চেতনাকে কিছু জিজ্ঞেস করুন...',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSend(input.trim());
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading && onStop) {
      onStop();
      return;
    }
    if (input.trim() && !isLoading) {
      onSend(input.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl px-4 sm:px-6">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex flex-col rounded-2xl border border-[#E4E2DC] bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.03)] focus-within:border-[#006A4E]/50 focus-within:ring-2 focus-within:ring-[#006A4E]/10 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="w-full resize-none border-0 bg-transparent px-3 py-2 text-sm sm:text-base text-[#18181B] placeholder-[#9E9E98] focus:outline-none focus:ring-0 font-bengali leading-relaxed max-h-[180px]"
          />

          <div className="flex items-center justify-between px-2 pt-1 pb-0.5">
            {/* Subtle contextual hint */}
            <div className="flex items-center gap-1.5 text-[11px] text-[#A1A1A6] font-bengali">
              {isLoading ? (
                <span className="flex items-center gap-1.5 text-[#006A4E]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#006A4E] animate-ping" />
                  একটু ভাবতেছি...
                </span>
              ) : (
                <span className="hidden sm:inline">
                  Enter চেপে পাঠান, নতুন লাইনের জন্য Shift+Enter
                </span>
              )}
            </div>

            {/* Simple, minimal send button */}
            <div className="flex items-center">
              {isLoading ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#18181B] text-white hover:bg-[#27272A] transition-colors"
                  title="থামুন"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                    input.trim()
                      ? 'bg-[#006A4E] text-white hover:bg-[#00543E] shadow-sm'
                      : 'bg-[#F2F1EB] text-[#B0AEA6] cursor-not-allowed'
                  }`}
                  aria-label="Send message"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
