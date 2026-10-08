import React from 'react';
import { X, Sparkles, Languages, Volume2, Trash2, Brain, Coffee } from 'lucide-react';
import { ChetanaTone, ChetanaLanguage, UserPreferences } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updated: Partial<UserPreferences>) => void;
  onClearAllChats: () => void;
  balance: number;
  onRecharge: (amount: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onClearAllChats,
  balance,
  onRecharge,
}) => {
  if (!isOpen) return null;

  const toneOptions: { id: ChetanaTone; title: string; desc: string }[] = [
    {
      id: 'balanced',
      title: 'স্বাভাবিক চেতনা (Balanced)',
      desc: 'বুদ্ধিমান ও আত্মবিশ্বাসী, অপ্রত্যাশিত বাংলাদেশী পর্যবেক্ষণ।',
    },
    {
      id: 'witty',
      title: 'কড়া চেতনা (Extra Wit)',
      desc: 'উদ্ভট কনফিডেন্স, চরম লোকাল হিউমার ও ডেডপ্যান রিয়ালিটি চেক।',
    },
    {
      id: 'formal',
      title: 'অফিস মোড (Formal)',
      desc: 'গম্ভীর প্রফেশনাল, কাজের কথা বেশি কিন্তু ভেতর ভেতর সজাগ।',
    },
  ];

  const langOptions: { id: ChetanaLanguage; label: string }[] = [
    { id: 'auto', label: 'স্বয়ংক্রিয় (Auto)' },
    { id: 'bn', label: 'বাংলা (Bangla)' },
    { id: 'banglish', label: 'Banglish' },
    { id: 'en', label: 'English' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-xs"
      onClick={onClose}
    >
      <div className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 pt-20 pb-8 sm:pt-24 sm:pb-12">
        <div
          className="w-full max-w-md rounded-2xl border border-[#E5E3DC] bg-[#FAF9F5] p-6 shadow-2xl transition-all"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ECEAE3]">
          <div>
            <h3 className="text-base font-semibold text-[#18181B] font-bengali">
              চেতনার সেটিংস
            </h3>
            <p className="text-xs text-[#71717A] font-bengali">
              আপনার পছন্দ অনুযায়ী আচরণ ও অডিও নির্ধারণ করুন
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#EFECE5] hover:text-[#18181B] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Chetana Card Quick Status */}
        <div className="py-3 border-b border-[#ECEAE3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-[#006A4E]" />
            <div>
              <span className="text-xs sm:text-sm font-medium text-[#18181B] font-bengali">
                চেতনা Card স্থিতি
              </span>
              <p className="text-[11px] text-[#71717A] font-bengali">
                বর্তমান ব্যালেন্স: <strong className="text-[#18181B]">{balance} চেতনা</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => onRecharge(100)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#006A4E]/30 bg-[#006A4E]/10 px-2.5 py-1 text-xs font-semibold text-[#006A4E] hover:bg-[#006A4E]/20 transition-all font-bengali"
          >
            <Coffee className="h-3 w-3" />
            <span>+১০০ চেতনা</span>
          </button>
        </div>

        {/* 🔊 চেতনা Sound Toggle (Requested explicitly) */}
        <div className="flex items-center justify-between py-3 border-b border-[#ECEAE3]">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-[#006A4E]" />
            <div>
              <span className="text-xs sm:text-sm font-medium text-[#27272A] font-bengali">
                🔊 চেতনা Sound
              </span>
              <p className="text-[11px] text-[#71717A] font-bengali">
                সিগনেচার “চে—তনা!” ব্র্যান্ড অডিও ও ডিজিটাল পপ (ডিফল্ট অন)
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              onUpdatePreferences({ soundEnabled: !preferences.soundEnabled })
            }
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              preferences.soundEnabled ? 'bg-[#006A4E]' : 'bg-[#D4D2CA]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                preferences.soundEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Tone Selection */}
        <div className="py-3 space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#71717A] font-bengali">
            <Sparkles className="h-3.5 w-3.5 text-[#006A4E]" />
            চেতনার মেজাজ (Tone)
          </label>
          <div className="space-y-1.5 pt-1">
            {toneOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onUpdatePreferences({ tone: opt.id })}
                className={`w-full text-left rounded-xl p-2.5 border transition-all font-bengali ${
                  preferences.tone === opt.id
                    ? 'border-[#006A4E] bg-white ring-1 ring-[#006A4E]'
                    : 'border-[#E4E2DC] bg-[#F5F4EF] hover:border-[#D4D2CA]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#18181B]">
                    {opt.title}
                  </span>
                  {preferences.tone === opt.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#006A4E]" />
                  )}
                </div>
                <p className="text-[11px] text-[#71717A] mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="py-2.5 space-y-1.5 border-t border-[#ECEAE3]">
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#71717A] font-bengali">
            <Languages className="h-3.5 w-3.5 text-[#006A4E]" />
            উত্তরের ভাষা
          </label>
          <div className="grid grid-cols-4 gap-1.5 pt-0.5 font-bengali">
            {langOptions.map((lang) => (
              <button
                key={lang.id}
                onClick={() => onUpdatePreferences({ language: lang.id })}
                className={`rounded-lg px-2 py-1 text-xs font-medium border text-center transition-all ${
                  preferences.language === lang.id
                    ? 'border-[#006A4E] bg-white text-[#006A4E] font-semibold'
                    : 'border-[#E4E2DC] bg-[#F5F4EF] text-[#52525B] hover:border-[#D4D2CA]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear all chats */}
        <div className="pt-3 border-t border-[#ECEAE3] flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('সব আড্ডা ও ইতিহাস মুছে ফেলতে চান?')) {
                onClearAllChats();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-bengali transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>সব চ্যাট মুছুন</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-lg bg-[#18181B] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#27272A] transition-colors font-bengali"
          >
            ঠিক আছে
          </button>
        </div>
      </div>
    </div>
  </div>
  );
};
