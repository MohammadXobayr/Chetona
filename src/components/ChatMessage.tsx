import React, { useState } from 'react';
import { Copy, Check, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { Message } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
  onRegenerate?: () => void;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLatest,
  onRegenerate,
  isStreaming,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.content);
    // Detect if content contains Bengali
    const hasBengali = /[\u0980-\u09FF]/.test(message.content);
    utterance.lang = hasBengali ? 'bn-BD' : 'en-US';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (isUser) {
    return (
      <div className="flex w-full justify-end py-3">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-[#1E1E24] px-4 py-2.5 text-sm sm:text-[15px] text-[#FAFAFA] font-bengali leading-relaxed shadow-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant Message (Clean, unboxed, plenty of whitespace)
  return (
    <div className="group flex w-full flex-col py-4">
      {/* Sender Header */}
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-[#006A4E]/10 text-[#006A4E]">
          <Sparkles className="h-3 w-3" />
        </div>
        <span className="text-xs font-semibold tracking-wide text-[#27272A]">
          CHETONA
        </span>
        {isStreaming && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[#006A4E] font-bengali animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-[#006A4E]" />
            চেতনা আসতেছে...
          </span>
        )}
      </div>

      {/* Message Body */}
      <div className="text-sm sm:text-[15px] font-bengali text-[#1F2024] pl-7">
        <MarkdownRenderer content={message.content} />

        {isStreaming && (
          <span className="inline-block ml-1 h-4 w-1.5 align-middle bg-[#006A4E] animate-pulse" />
        )}
      </div>

      {/* Action Footer (Copy, Regenerate, Speak) */}
      {!isStreaming && message.content && (
        <div className="mt-2.5 flex items-center gap-2 pl-7 opacity-75 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#71717A] hover:bg-[#F2F0EB] hover:text-[#18181B] transition-colors font-bengali"
            title="কপি করুন"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-[#006A4E]" />
                <span className="text-[11px] text-[#006A4E]">কপি হয়েছে</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span className="text-[11px]">কপি</span>
              </>
            )}
          </button>

          {'speechSynthesis' in window && (
            <button
              onClick={handleSpeak}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs ${
                isSpeaking ? 'text-[#006A4E] bg-[#006A4E]/10' : 'text-[#71717A]'
              } hover:bg-[#F2F0EB] hover:text-[#18181B] transition-colors font-bengali`}
              title="পড়ে শোনান"
            >
              <Volume2 className="h-3 w-3" />
              <span className="text-[11px]">{isSpeaking ? 'থামান' : 'শুনুন'}</span>
            </button>
          )}

          {isLatest && onRegenerate && (
            <button
              onClick={onRegenerate}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#71717A] hover:bg-[#F2F0EB] hover:text-[#18181B] transition-colors font-bengali"
              title="আবার লিখুন"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="text-[11px]">আবার ভাবুন</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
