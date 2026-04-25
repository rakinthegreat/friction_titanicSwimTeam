import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Check, X } from 'lucide-react';

interface Option {
  optiontext: string;
  is_correct: boolean;
  description?: string;
}

interface MCQInteractionProps {
  question: string;
  options: Option[];
  onSubmit: (isCorrect: boolean, selectedOption: string, correctOption: string) => void;
  autoSubmit?: boolean;
  manualConfirm?: boolean;
  showQuestion?: boolean;
  colorScheme?: 'classic' | 'modern';
}

export const MCQInteraction = ({
  question,
  options,
  onSubmit,
  autoSubmit = false,
  manualConfirm = false,
  showQuestion = true,
  colorScheme = 'modern'
}: MCQInteractionProps) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (idx: number) => {
    if (isSubmitted) return;
    setSelectedIdx(idx);

    if (!manualConfirm) {
      setIsSubmitted(true);
      const selected = options[idx];
      const correct = options.find(o => o.is_correct) || options[0];
      const delay = autoSubmit ? 600 : (selected.description ? 2500 : 1200);

      setTimeout(() => {
        onSubmit(selected.is_correct, selected.optiontext, correct.optiontext);
        setSelectedIdx(null);
        setIsSubmitted(false);
      }, delay);
    }
  };

  const handleConfirm = () => {
    if (selectedIdx === null) return;
    setIsSubmitted(true);
  };

  const handleNext = () => {
    if (selectedIdx === null) return;
    const selected = options[selectedIdx];
    const correct = options.find(o => o.is_correct) || options[0];
    onSubmit(selected.is_correct, selected.optiontext, correct.optiontext);
    setSelectedIdx(null);
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      {showQuestion && (
        <h2 className="text-2xl sm:text-3xl font-black leading-tight">{question}</h2>
      )}

      <div className="grid grid-cols-1 gap-4">
        {options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          let variant = "default";

          if (isSubmitted) {
            if (option.is_correct) {
              variant = "correct";
            } else if (isSelected && !option.is_correct) {
              variant = "incorrect";
            }
          } else if (isSelected) {
            variant = "selected";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={isSubmitted}
              className={`
                group relative p-6 rounded-[2rem] text-left transition-all duration-300 border-2
                ${variant === 'default' ? 'bg-card border-transparent shadow-neo-out hover:border-accent-secondary/30' : ''}
                ${variant === 'selected' ? 'bg-accent-secondary/10 border-accent-secondary shadow-neo-in' : ''}
                ${variant === 'correct' ? (colorScheme === 'classic' ? 'bg-[#22C55E] border-[#22C55E] text-white shadow-neo-in' : 'bg-[#7EA68B] border-[#7EA68B] text-white shadow-neo-in') : ''}
                ${variant === 'incorrect' ? (colorScheme === 'classic' ? 'bg-[#EF4444] border-[#EF4444] text-white shadow-neo-in' : 'bg-[#DC2626] border-[#DC2626] text-white shadow-neo-in') : ''}
                ${isSubmitted && variant === 'default' ? 'opacity-40 grayscale-[0.5] scale-[0.95] shadow-none' : ''}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0
                  ${variant === 'default' ? 'border-foreground/20 group-hover:border-accent-secondary/50' : ''}
                  ${variant === 'selected' ? 'border-accent-secondary bg-accent-secondary text-white' : ''}
                  ${variant === 'correct' ? (colorScheme === 'classic' ? 'border-[#22C55E] bg-[#22C55E] text-white' : 'border-[#7EA68B] bg-[#7EA68B] text-white') : ''}
                  ${variant === 'incorrect' ? (colorScheme === 'classic' ? 'border-[#EF4444] bg-[#EF4444] text-white' : 'border-[#DC2626] bg-[#DC2626] text-white') : ''}
                `}>
                  {isSubmitted && option.is_correct && <Check className="w-5 h-5" />}
                  {isSubmitted && isSelected && !option.is_correct && <X className="w-5 h-5" />}
                  {!isSubmitted && <span className="text-xs font-bold">{String.fromCharCode(65 + idx)}</span>}
                </div>
                <span className={`text-lg font-bold ${variant === 'correct' || variant === 'incorrect' ? 'text-white' : variant === 'selected' ? 'text-accent-secondary' : 'text-foreground/80'}`}>
                  {option.optiontext}
                </span>
              </div>
              {isSubmitted && option.description && (
                <div className="mt-2 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 opacity-90 border-t border-white/20 pt-2 ml-12">
                  {option.description}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {manualConfirm && (
        <div className="pt-4">
          {!isSubmitted ? (
            <button
              onClick={handleConfirm}
              disabled={selectedIdx === null}
              className={`
                w-full py-5 rounded-[2rem] font-black text-xl transition-all shadow-neo-out
                ${selectedIdx !== null
                  ? 'bg-accent-secondary text-white hover:scale-[1.02] active:scale-95'
                  : 'bg-black/10 dark:bg-white/10 text-foreground/40 cursor-not-allowed shadow-none'}
              `}
            >
              Confirm Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-5 rounded-[2rem] font-black text-xl bg-accent-secondary text-white hover:scale-[1.02] active:scale-95 shadow-neo-out animate-in fade-in zoom-in duration-500 ring-4 ring-accent-secondary/30 flex items-center justify-center gap-2 group"
            >
              Next Question
            </button>
          )}
        </div>
      )}
    </div>
  );
};
