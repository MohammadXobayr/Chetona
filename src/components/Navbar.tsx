import React from 'react';
import { Settings, Plus, Clock, Sparkles, Flame } from 'lucide-react';
import { ChetanaTone, BalanceChange } from '../types';
import { ChetanaCardBadge } from './ChetanaCardBadge';

interface NavbarProps {
  onNewChat: () => void;
  onOpenSettings: () => void;
  onToggleHistory: () => void;
  tone: ChetanaTone;
  historyCount: number;
  chetanaMode: boolean;
  onToggleChetanaMode?: () => void;
  balance: number;
  recentChange: BalanceChange | null;
  onRecharge: (amount: number) => void;
  isLogoReacting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewChat,
  onOpenSettings,
  onToggleHistory,
  tone,
  historyCount,
  chetanaMode,
  onToggleChetanaMode,
  balance,
  recentChange,
  onRecharge,
  isLogoReacting,
}) => {
  const getToneLabel = (t: ChetanaTone) => {
    switch (t) {
      case 'witty':
        return 'কড়া চেতনা';
      case 'formal':
        return 'অফিস মোড';
      case 'balanced':
      default:
        return 'স্বাভাবিক';
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#ECEAE4] bg-[#FBFBF9]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
        {/* Brand identity with micro-interaction reaction */}
        <div
          className={`flex flex-col cursor-pointer transition-transform duration-200 select-none ${
            isLogoReacting ? 'scale-[1.04]' : 'scale-100'
          }`}
          onClick={onNewChat}
          title="CHETONA"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-[0.14em] text-sm sm:text-base text-[#18181B]">
              CHETONA
            </span>
            <span className="text-xs font-normal text-[#71717A] tracking-normal font-bengali">
              (চেতনা)
            </span>
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full bg-[#006A4E] transition-all duration-200 ${
                isLogoReacting ? 'scale-150 ring-4 ring-[#006A4E]/20' : ''
              }`}
              title="Active"
            />
          </div>
          <span className="text-[11px] sm:text-xs text-[#71717A] font-bengali tracking-tight">
            বাংলাদেশের AI, একটু বেশি চেতনা আছে।
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Chetana Card Gamification Badge */}
          <ChetanaCardBadge
            balance={balance}
            recentChange={recentChange}
            onRecharge={onRecharge}
            isLogoReacting={isLogoReacting}
          />

          {/* Short Roast Mode Indicator */}
          <button
            onClick={onToggleChetanaMode}
            className={`hidden md:inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all font-bengali ${
              chetanaMode
                ? 'border-amber-300 bg-amber-50 text-amber-800'
                : 'border-[#E4E2DC] bg-[#F5F4EF] text-[#71717A]'
            }`}
            title="Short Roast Mode: ৫-২৫ শব্দের স্যাভেজ উত্তর"
          >
            <Flame className="h-3 w-3 text-amber-600" />
            <span>শর্ট রোস্ট</span>
          </button>

          {/* Past Chats / History */}
          {historyCount > 0 && (
            <button
              onClick={onToggleHistory}
              aria-label="কথোপকথনের তালিকা"
              title="পূর্ববর্তী চ্যাট"
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-transparent px-2.5 py-1.5 text-xs text-[#52525B] hover:border-[#E4E2DC] hover:bg-[#F4F3EE] hover:text-[#18181B] transition-all"
            >
              <Clock className="h-3.5 w-3.5 text-[#71717A]" />
              <span className="hidden lg:inline font-bengali">আগের আড্ডা</span>
            </button>
          )}

          {/* New Chat button */}
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 rounded-lg border border-[#E4E2DC] bg-[#FAF9F5] px-3 py-1.5 text-xs font-medium text-[#27272A] shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-[#D4D2CA] hover:bg-white active:scale-[0.98] transition-all font-bengali"
          >
            <Plus className="h-3.5 w-3.5 text-[#006A4E]" />
            <span>New Chat</span>
          </button>

          {/* Settings icon */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="rounded-lg p-2 text-[#71717A] hover:bg-[#F2F1EB] hover:text-[#18181B] transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
