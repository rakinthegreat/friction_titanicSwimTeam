import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Check, X } from 'lucide-react';

interface Option {
  optiontext: string;
  is_correct: boolean;
}

interface MCQInteractionProps {
  question: string;
  options: Option[];
  onSubmit: (isCorrect: boolean, selectedOption: string, correctOption: string) => void;
}

export const MCQInteraction = ({ question, options, onSubmit }: MCQInteractionProps) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (idx: number) => {
    if (isSubmitted) return;
    setSelectedIdx(idx);
  };

  const handleSubmit = () => {
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
      <h2 className="text-2xl sm:text-3xl font-black leading-tight">{question}</h2>

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
                ${variant === 'correct' ? 'bg-green-500/20 border-green-500 shadow-neo-in' : ''}
                ${variant === 'incorrect' ? 'bg-red-500/20 border-red-500 shadow-neo-in' : ''}
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors
                  ${variant === 'default' ? 'border-foreground/20 group-hover:border-accent-secondary/50' : ''}
                  ${variant === 'selected' ? 'border-accent-secondary bg-accent-secondary text-white' : ''}
                  ${variant === 'correct' ? 'border-green-500 bg-green-500 text-white' : ''}
                  ${variant === 'incorrect' ? 'border-red-500 bg-red-500 text-white' : ''}
                `}>
                  {isSubmitted && option.is_correct && <Check className="w-5 h-5" />}
                  {isSubmitted && isSelected && !option.is_correct && <X className="w-5 h-5" />}
                  {!isSubmitted && <span className="text-xs font-bold">{String.fromCharCode(65 + idx)}</span>}
                </div>
                <span className={`text-lg font-bold ${variant === 'selected' ? 'text-accent-secondary' : 'text-foreground/80'}`}>
                  {option.optiontext}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {!isSubmitted ? (
        <button
          onClick={handleSubmit}
          disabled={selectedIdx === null}
          className={`
            w-full py-5 rounded-2xl font-black text-xl transition-all shadow-neo-out
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
          className="w-full py-5 rounded-2xl font-black text-xl bg-accent-secondary text-white hover:scale-[1.02] active:scale-95 shadow-neo-out animate-in fade-in zoom-in duration-500 ring-4 ring-accent-secondary/30 flex items-center justify-center gap-2 group"
        >
          Continue
          <Check className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
};
