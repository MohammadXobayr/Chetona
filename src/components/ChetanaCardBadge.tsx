import React, { useState } from 'react';
import { Brain, Sparkles, X, Coffee, Info } from 'lucide-react';
import { BalanceChange } from '../types';

interface ChetanaCardBadgeProps {
  balance: number;
  recentChange: BalanceChange | null;
  onRecharge: (amount: number) => void;
  isLogoReacting?: boolean;
}

export const ChetanaCardBadge: React.FC<ChetanaCardBadgeProps> = ({
  balance,
  recentChange,
  onRecharge,
  isLogoReacting,
}) => {
  const [showModal, setShowModal] = useState(false);

  const isLow = balance > 0 && balance <= 100;
  const isVeryLow = balance > 0 && balance <= 20;
  const isEmpty = balance <= 0;

  return (
    <>
      <div className="relative inline-flex items-center">
        {/* The Badge */}
        <button
          onClick={() => setShowModal(true)}
          className={`group flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium font-bengali transition-all shadow-xs ${
            isEmpty
              ? 'border-red-300 bg-red-50 text-red-700 animate-pulse'
              : isVeryLow
              ? 'border-amber-300 bg-amber-50 text-amber-800'
              : isLow
              ? 'border-emerald-200 bg-emerald-50/60 text-[#006A4E]'
              : 'border-[#E4E2DC] bg-[#F7F6F1] text-[#27272A] hover:border-[#D4D2CA] hover:bg-white'
          } ${isLogoReacting ? 'scale-105' : 'scale-100'} transition-transform duration-200`}
          title="আপনার চেতনা কার্ড ব্যালেন্স"
        >
          <Brain
            className={`h-3.5 w-3.5 ${
              isEmpty
                ? 'text-red-500'
                : isVeryLow
                ? 'text-amber-600'
                : 'text-[#006A4E]'
            }`}
          />
          <span className="font-semibold tracking-tight">{balance}</span>
          <span className="text-[11px] text-[#71717A] group-hover:text-[#27272A]">
            চেতনা
          </span>
        </button>

        {/* Floating microcopy notification when consuming or earning */}
        {recentChange && (
          <div
            key={recentChange.id}
            className={`pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[10px] font-bold font-bengali shadow-xs animate-in fade-in slide-in-from-top-1 duration-200 ${
              recentChange.type === 'consume'
                ? 'bg-[#18181B] text-white'
                : 'bg-[#006A4E] text-white'
            }`}
          >
            {recentChange.text}
          </div>
        )}
      </div>

      {/* Chetana Card Info / Recharge Dialog */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-xs"
          onClick={() => setShowModal(false)}
        >
          <div className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 pt-20 pb-8 sm:pt-24 sm:pb-12">
            <div
              className="w-full max-w-sm rounded-2xl border border-[#E5E3DC] bg-[#FAF9F5] p-5 shadow-2xl transition-all"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between pb-3 border-b border-[#ECEAE3]">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#006A4E]/10 text-[#006A4E]">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#18181B] font-bengali">
                    চেতনা Card
                  </h3>
                  <p className="text-[11px] text-[#71717A] font-bengali">
                    একটি কাল্পনিক ইন্টারঅ্যাকশন সূচক
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-[#71717A] hover:bg-[#EFECE5] hover:text-[#18181B] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Current Balance Card */}
            <div className="my-4 rounded-xl border border-[#E4E2DC] bg-white p-4 text-center font-bengali">
              <span className="text-[11px] uppercase tracking-wider text-[#71717A]">
                বর্তমান স্থিতি
              </span>
              <div className="my-1 flex items-center justify-center gap-1.5 text-3xl font-bold text-[#18181B]">
                <span>{balance}</span>
                <span className="text-sm font-normal text-[#71717A]">চেতনা</span>
              </div>

              {/* Status Microcopy */}
              {isEmpty ? (
                <div className="mt-2 text-xs text-red-600 space-y-0.5">
                  <p className="font-semibold">চেতনা শেষ।</p>
                  <p className="text-[11px] text-[#71717A]">
                    এখন একটু নিজের চেতনা ব্যবহার করুন।
                  </p>
                </div>
              ) : isVeryLow ? (
                <div className="mt-2 text-xs text-amber-700">
                  <p className="font-medium">
                    আপনার চেতনা প্রায় শেষ। এখন একটু বাস্তব জীবনে ফিরেন।
                  </p>
                </div>
              ) : isLow ? (
                <div className="mt-2 text-xs text-emerald-700">
                  <p className="font-medium">চেতনা একটু কমে গেছে।</p>
                </div>
              ) : (
                <p className="mt-1 text-[11px] text-[#71717A]">
                  প্রতিটি মেসেজে ২-৩ চেতনা খরচ হয়, চিন্তাভাবনায় বাড়ে।
                </p>
              )}
            </div>

            {/* Explanatory playful copy */}
            <div className="space-y-2 rounded-xl bg-[#F4F3EE] p-3 text-xs text-[#52525B] font-bengali leading-relaxed">
              <div className="flex items-start gap-1.5 text-[11px]">
                <Info className="h-3.5 w-3.5 text-[#006A4E] shrink-0 mt-0.5" />
                <p>
                  চেতনা কোনো আসল টাকা বা ক্রিপ্টোকারেন্সি নয়। এটি কখনোই কিনতে হয় না।
                  টংয়ের চা খেলেই মানুষের চেতনা রিচার্জ হয়।
                </p>
              </div>
            </div>

            {/* Action / Free Playful Recharge */}
            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  onRecharge(150);
                  setShowModal(false);
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#006A4E]/30 bg-[#006A4E]/10 px-3 py-2 text-xs font-semibold text-[#006A4E] hover:bg-[#006A4E]/15 transition-all font-bengali"
              >
                <Coffee className="h-3.5 w-3.5" />
                <span>চা খেয়ে +১৫০ চেতনা নিন ☕</span>
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-[#18181B] px-4 py-2 text-xs font-medium text-white hover:bg-[#27272A] transition-colors font-bengali"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
};
