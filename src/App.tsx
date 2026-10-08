import React, { useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from './components/Navbar';
import { SuggestionChips } from './components/SuggestionChips';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { HistorySidebar } from './components/HistorySidebar';
import { Message, ChatSession, UserPreferences, BalanceChange } from './types';
import { chetonaAudio, ChetanaSoundVariant } from './utils/audio';
import { useAuth } from './context/AuthContext';
import {
  syncUserProfile,
  updateCloudBalance,
  fetchCloudSessions,
  saveCloudSession,
  deleteCloudSession,
} from './lib/firestoreService';

const STORAGE_KEY_SESSIONS = 'chetona_chat_sessions_v1';
const STORAGE_KEY_PREFS = 'chetona_user_prefs_v1';
const STORAGE_KEY_BALANCE = 'chetona_card_balance_v1';

const DEFAULT_PREFERENCES: UserPreferences = {
  tone: 'balanced',
  language: 'auto',
  soundEnabled: true,
  chetanaMode: true,
};

export default function App() {
  const { user } = useAuth();

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Chetana Card Balance: Starting balance 1000 চেতনা
  const [balance, setBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BALANCE);
      return saved !== null ? parseInt(saved, 10) : 1000;
    } catch {
      return 1000;
    }
  });

  const [recentBalanceChange, setRecentBalanceChange] = useState<BalanceChange | null>(null);
  const [isLogoReacting, setIsLogoReacting] = useState<boolean>(false);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PREFERENCES, ...parsed };
      }
      return DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const changeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
    } catch {
      // Ignore
    }
  }, [sessions]);

  // Sync balance to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BALANCE, balance.toString());
    } catch {
      // Ignore
    }
  }, [balance]);

  // Sync preferences to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(preferences));
    } catch {
      // Ignore
    }
  }, [preferences]);

  // Auto-scroll on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Sync with Firestore when user logs in
  useEffect(() => {
    if (!user) return;
    let isCancelled = false;

    async function initFirebaseSync() {
      if (!user) return;
      try {
        const cloudBal = await syncUserProfile(user, balance);
        if (!isCancelled && typeof cloudBal === 'number') {
          setBalance(cloudBal);
        }

        const cloudSessions = await fetchCloudSessions(user.uid);
        if (!isCancelled && cloudSessions && cloudSessions.length > 0) {
          setSessions((local) => {
            const merged = [...cloudSessions];
            for (const s of local) {
              if (!merged.some((m) => m.id === s.id)) {
                merged.push(s);
              }
            }
            return merged.sort((a, b) => b.updatedAt - a.updatedAt);
          });
        }
      } catch (err) {
        console.error('Firebase sync error:', err);
      }
    }

    initFirebaseSync();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // Helper to trigger signature logo reaction (180-250ms) & sound
  const triggerSignatureReaction = (variant: ChetanaSoundVariant) => {
    setIsLogoReacting(true);
    setTimeout(() => {
      setIsLogoReacting(false);
    }, 220);

    chetonaAudio.playSignature(variant, preferences.soundEnabled);
  };

  const updateBalance = (delta: number, customLabel?: string) => {
    setBalance((prev) => {
      const next = Math.max(0, prev + delta);
      if (user) {
        updateCloudBalance(user.uid, next).catch(console.error);
      }
      return next;
    });

    const isConsume = delta < 0;
    const text = customLabel || (isConsume ? `${delta} চেতনা` : `+${delta} চেতনা`);

    const change: BalanceChange = {
      id: 'change_' + Date.now(),
      amount: delta,
      text,
      type: isConsume ? 'consume' : 'reward',
    };

    setRecentBalanceChange(change);

    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }
    changeTimeoutRef.current = setTimeout(() => {
      setRecentBalanceChange(null);
    }, 2200);
  };

  const saveCurrentSession = (updatedMessages: Message[]) => {
    if (updatedMessages.length === 0) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = 'session_' + Date.now();
      setActiveSessionId(sessionId);
    }

    const firstUserMsg = updatedMessages.find((m) => m.role === 'user');
    const title = firstUserMsg ? firstUserMsg.content.slice(0, 35) : 'নতুন আড্ডা';

    let targetSession: ChatSession | null = null;

    setSessions((prev) => {
      const exists = prev.find((s) => s.id === sessionId);
      if (exists) {
        targetSession = { ...exists, messages: updatedMessages, updatedAt: Date.now() };
        return prev.map((s) => (s.id === sessionId ? targetSession! : s));
      } else {
        targetSession = {
          id: sessionId!,
          title,
          messages: updatedMessages,
          updatedAt: Date.now(),
        };
        return [targetSession, ...prev];
      }
    });

    if (user && targetSession) {
      saveCloudSession(user.uid, targetSession).catch(console.error);
    }
  };

  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setActiveSessionId(null);
    setMessages([]);
    setInput('');
    setIsLoading(false);
    setIsStreaming(false);
    setErrorMessage(null);

    triggerSignatureReaction('new_chat');

    if (balance < 1000) {
      updateBalance(5, '+৫ চেতনা (নতুন আড্ডা)');
    }
  };

  const handleSelectSession = (id: string) => {
    const target = sessions.find((s) => s.id === id);
    if (target) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setActiveSessionId(target.id);
      setMessages(target.messages);
      setIsLoading(false);
      setIsStreaming(false);
      setErrorMessage(null);
      triggerSignatureReaction('new_chat');
    }
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (user) {
      deleteCloudSession(user.uid, id).catch(console.error);
    }
    if (activeSessionId === id) {
      handleNewChat();
    }
  };

  const handleClearAllChats = () => {
    if (user) {
      for (const s of sessions) {
        deleteCloudSession(user.uid, s.id).catch(console.error);
      }
    }
    setSessions([]);
    handleNewChat();
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setIsStreaming(false);
  };

  const handleRecharge = (amount: number) => {
    updateBalance(amount, `+${amount} চেতনা`);
    triggerSignatureReaction('reward');
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    if (balance <= 0) {
      setErrorMessage('চেতনা শেষ। এখন একটু নিজের চেতনা ব্যবহার করুন অথবা টংয়ের চা খেয়ে রিচার্জ নিন ☕');
      triggerSignatureReaction('error');
      return;
    }

    setErrorMessage(null);
    const userMessage: Message = {
      id: 'msg_u_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    updateBalance(-2, '-২ চেতনা');
    triggerSignatureReaction('send');

    const assistantMsgId = 'msg_a_' + Date.now();
    const assistantMessage: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const messagesWithAssistant = [...newMessages, assistantMessage];
    setMessages(messagesWithAssistant);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          tone: preferences.tone,
          language: preferences.language,
          chetanaMode: preferences.chetanaMode,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedContent += parsed.text;
                setMessages((current) =>
                  current.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            } catch {
              // Ignore partial JSON
            }
          }
        }
      }

      setIsLoading(false);
      setIsStreaming(false);

      const finalMessages = messagesWithAssistant.map((msg) =>
        msg.id === assistantMsgId
          ? { ...msg, content: accumulatedContent || 'চেতনা সবসময় পাশে আছে।', isStreaming: false }
          : msg
      );
      setMessages(finalMessages);
      saveCurrentSession(finalMessages);

      if (Math.random() > 0.6) {
        updateBalance(1, '+১ চেতনা (বুদ্ধিমান চিন্তা)');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setIsLoading(false);
        setIsStreaming(false);
        return;
      }

      console.error('Streaming error, falling back to unary endpoint:', err);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            tone: preferences.tone,
            language: preferences.language,
            chetanaMode: preferences.chetanaMode,
          }),
        });

        const data = await res.json();
        const reply = data.text || 'চেতনা একটু আটকে গেছে। আবার চেষ্টা করেন।';

        const finalMessages = messagesWithAssistant.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: reply, isStreaming: false }
            : msg
        );
        setMessages(finalMessages);
        saveCurrentSession(finalMessages);
        setIsLoading(false);
        setIsStreaming(false);
      } catch (fallbackErr) {
        console.error('Complete chat failure:', fallbackErr);
        setErrorMessage('চেতনা একটু আটকে গেছে। আবার চেষ্টা করেন।');
        triggerSignatureReaction('error');
        setMessages((current) => current.filter((m) => m.id !== assistantMsgId));
        setIsLoading(false);
        setIsStreaming(false);
      }
    }
  };

  const handleRegenerate = () => {
    if (isLoading || messages.length === 0) return;

    const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIndex === -1) return;

    const actualIndex = messages.length - 1 - lastUserIndex;
    const userPrompt = messages[actualIndex].content;

    const trimmed = messages.slice(0, actualIndex);
    setMessages(trimmed);
    handleSend(userPrompt);
  };

  const handleToggleChetanaMode = () => {
    setPreferences((prev) => ({
      ...prev,
      chetanaMode: !prev.chetanaMode,
    }));
  };

  const hasMessages = messages.length > 0;
  const isZeroBalance = balance <= 0;
  const isVeryLowBalance = balance > 0 && balance <= 20;

  return (
    <div className="flex min-h-screen flex-col bg-[#FBFBF9] text-[#191919]">
      {/* Top navigation with Chetana Card & Logo Reaction */}
      <Navbar
        onNewChat={handleNewChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleHistory={() => setIsHistoryOpen(true)}
        tone={preferences.tone}
        historyCount={sessions.length}
        chetanaMode={preferences.chetanaMode}
        onToggleChetanaMode={handleToggleChetanaMode}
        balance={balance}
        recentChange={recentBalanceChange}
        onRecharge={handleRecharge}
        isLogoReacting={isLogoReacting}
      />

      {/* Main chat viewport */}
      <main className="flex flex-1 flex-col justify-between">
        {!hasMessages ? (
          /* Empty state: Centered vertically */
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-8 text-center animate-in fade-in duration-300">
            {/* Branding Hero */}
            <div className="mb-7 space-y-2">
              <h1
                onClick={() => triggerSignatureReaction('send')}
                className={`text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#18181B] font-bengali cursor-pointer transition-transform duration-200 select-none ${
                  isLogoReacting ? 'scale-[1.03]' : 'scale-100'
                }`}
                title="ক্লিক করে চেতনার ডাক শুনুন"
              >
                আজ কী নিয়ে চেতনা দরকার?
              </h1>
              <p className="text-sm sm:text-base text-[#71717A] font-bengali flex items-center justify-center gap-1.5">
                <span>Ask anything.</span>
                <span className="text-[#006A4E] font-medium">চেতনা আছে।</span>
              </p>
            </div>

            {/* Suggestion Chips */}
            <SuggestionChips onSelectSuggestion={handleSend} />
          </div>
        ) : (
          /* Active chat view */
          <div className="mx-auto w-full max-w-3xl flex-1 px-4 sm:px-6 py-6 overflow-y-auto">
            <div className="space-y-2">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLatest={index === messages.length - 1}
                  onRegenerate={handleRegenerate}
                  isStreaming={isStreaming && index === messages.length - 1}
                />
              ))}

              {errorMessage && (
                <div className="my-3 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 font-bengali text-center flex flex-col items-center gap-2">
                  <p>{errorMessage}</p>
                  {isZeroBalance && (
                    <button
                      onClick={() => handleRecharge(150)}
                      className="rounded-lg bg-[#006A4E] px-3 py-1.5 text-xs text-white hover:bg-[#00553E] transition-colors"
                    >
                      টংয়ের চা খেয়ে +১৫০ চেতনা রিচার্জ নিন ☕
                    </button>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} className="h-6" />
            </div>
          </div>
        )}

        {/* Low balance notice */}
        {isZeroBalance ? (
          <div className="mx-auto my-1 max-w-md px-4 text-center">
            <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-xs text-red-700 font-bengali flex items-center justify-between">
              <div>
                <span className="font-semibold">চেতনা শেষ।</span>
                <span className="ml-1 text-[11px] text-red-600">এখন একটু নিজের চেতনা ব্যবহার করুন।</span>
              </div>
              <button
                onClick={() => handleRecharge(100)}
                className="ml-2 rounded-md bg-[#006A4E] px-2 py-0.5 text-[11px] text-white hover:bg-[#00553E]"
              >
                +১০০ রিচার্জ
              </button>
            </div>
          </div>
        ) : isVeryLowBalance ? (
          <div className="mx-auto my-1 max-w-md px-4 text-center">
            <p className="text-[11px] text-amber-700 font-bengali">
              আপনার চেতনা প্রায় শেষ। এখন একটু বাস্তব জীবনে ফিরেন।
            </p>
          </div>
        ) : null}

        {/* Bottom Message Input Area */}
        <div className="sticky bottom-0 z-20 pb-5 pt-2 bg-gradient-to-t from-[#FBFBF9] via-[#FBFBF9]/95 to-transparent flex flex-col items-center">
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={handleSend}
            isLoading={isLoading}
            onStop={handleStopGeneration}
            placeholder={isZeroBalance ? 'চেতনা রিচার্জ করে কথা বলুন...' : 'চেতনাকে কিছু জিজ্ঞেস করুন...'}
          />
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onUpdatePreferences={(updated) =>
          setPreferences((prev) => ({ ...prev, ...updated }))
        }
        onClearAllChats={handleClearAllChats}
        balance={balance}
        onRecharge={handleRecharge}
      />

      {/* History Slide-over Sidebar */}
      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onNewChat={handleNewChat}
      />
      
      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}
