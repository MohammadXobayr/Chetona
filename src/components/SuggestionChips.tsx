import React, { useState } from 'react';
import { ArrowUpRight, RotateCcw, Flame } from 'lucide-react';

interface SuggestionChipsProps {
  onSelectSuggestion: (text: string) => void;
}

const ROAST_DECK_1 = [
  'কাল থেকে পড়ব',
  'আমার crush reply দেয় না',
  'Boss আবার কাজ দিয়েছে',
  'আমি অনেক overthink করি',
];

const ROAST_DECK_2 = [
  'আমি আজকে gym যাব',
  'আমার friend টাকা ফেরত দেয় না',
  'আজকে খুব tired',
  'ঢাকায় traffic এত কেন?',
];

const ROAST_DECK_3 = [
  'আমি freelancing করব',
  'বিয়ে করব?',
  'আমার boss বলছে কাজটা easy',
  'আমার salary কম',
];

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({ onSelectSuggestion }) => {
  const [deckIndex, setDeckIndex] = useState(0);

  const decks = [ROAST_DECK_1, ROAST_DECK_2, ROAST_DECK_3];
  const currentChips = decks[deckIndex];

  return (
    <div className="w-full max-w-2xl px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {currentChips.map((text, idx) => (
          <button
            key={`${deckIndex}-${idx}`}
            onClick={() => onSelectSuggestion(text)}
            className="group flex items-center justify-between rounded-xl border border-[#E5E3DC] bg-[#FCFBF8] px-3.5 py-3 text-left text-xs sm:text-sm text-[#27272A] shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#006A4E]/30 hover:bg-white hover:shadow-[0_2px_6px_rgba(0,0,0,0.04)] transition-all font-bengali"
          >
            <span className="line-clamp-1 pr-2">{text}</span>
            <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0 text-[#A1A1AA] group-hover:text-[#006A4E] transition-colors" />
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          onClick={() => setDeckIndex((prev) => (prev + 1) % decks.length)}
          className="inline-flex items-center gap-1.5 text-[11px] text-[#71717A] hover:text-[#006A4E] transition-colors font-bengali"
        >
          <RotateCcw className="h-2.5 w-2.5" />
          <span>অন্যান্য প্রশ্ন দেখুন ({deckIndex + 1}/{decks.length})</span>
        </button>
      </div>
    </div>
  );
};
