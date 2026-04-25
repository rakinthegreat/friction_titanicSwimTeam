import React, { useState } from 'react';
import { Check, X, BookOpen } from 'lucide-react';
import { Card } from '../ui/Card';

interface Option {
  word: string;
  meaning: string;
}

interface EnglishFITBInteractionProps {
  question: string;
  options: Option[];
  answer: string;
  onSubmit: (isCorrect: boolean, selectedWord: string) => void;
}

export const EnglishFITBInteraction = ({ question, options, answer, onSubmit }: EnglishFITBInteractionProps) => {
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
    onSubmit(selected.word === answer, selected.word);
    setSelectedIdx(null);
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500 max-w-2xl mx-auto w-full">
      <div className="space-y-2 text-center">
        <h2 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em]">
          Fill in the blank
        </h2>
      </div>

      <Card className="p-8 sm:p-10 bg-card rounded-[3rem] shadow-neo-out relative overflow-hidden">
        <BookOpen className="absolute -top-12 -right-12 w-48 h-48 text-blue-400/5 rotate-12" />
        <div className="text-2xl sm:text-3xl font-black leading-tight relative z-10">
          {question.split('___').map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className={`inline-block px-4 py-1 mx-2 border-b-4 font-black transition-colors ${selectedIdx !== null ? 'border-blue-400 text-blue-400' : 'border-foreground/20 text-foreground/40'}`}>
                  {selectedIdx !== null ? options[selectedIdx].word : '______'}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {options.map((option, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrect = option.word === answer;
          let variant = "default";

          if (isSubmitted) {
            if (isCorrect) {
              variant = "correct";
            } else if (isSelected) {
              variant = "incorrect";
            } else {
              variant = "dimmed";
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
                group relative p-6 rounded-[2rem] text-left transition-all duration-300 border-2 flex flex-col
                ${variant === 'default' ? 'bg-card border-transparent shadow-neo-out hover:border-blue-400/30 hover:scale-[1.01]' : ''}
                ${variant === 'selected' ? 'bg-blue-400/10 border-blue-400 shadow-neo-in' : ''}
                ${variant === 'correct' ? 'bg-[#7EA68B] border-[#7EA68B] text-white shadow-neo-in' : ''}
                ${variant === 'incorrect' ? 'bg-[#DC2626] border-[#DC2626] text-white shadow-neo-in' : ''}
                ${variant === 'dimmed' ? 'bg-card border-transparent opacity-40 shadow-none' : ''}
              `}
            >
              <div className="flex items-center gap-4 w-full">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors flex-shrink-0
                  ${variant === 'default' ? 'border-foreground/20 group-hover:border-blue-400/50' : ''}
                  ${variant === 'selected' ? 'border-blue-400 bg-blue-400 text-white' : ''}
                  ${variant === 'correct' ? 'border-[#7EA68B] bg-[#7EA68B] text-white' : ''}
                  ${variant === 'incorrect' ? 'border-[#DC2626] bg-[#DC2626] text-white' : ''}
                  ${variant === 'dimmed' ? 'border-foreground/10 bg-transparent text-foreground/20' : ''}
                `}>
                  {isSubmitted && isCorrect && <Check className="w-5 h-5" />}
                  {isSubmitted && isSelected && !isCorrect && <X className="w-5 h-5" />}
                  {!isSubmitted && <span className="text-xs font-bold">{String.fromCharCode(65 + idx)}</span>}
                </div>
                <div className="flex-1">
                  <span className={`text-xl font-black block capitalize ${variant === 'correct' || variant === 'incorrect' ? 'text-white' : variant === 'selected' ? 'text-blue-400' : 'text-foreground/80'}`}>
                    {option.word}
                  </span>
                  {(isSubmitted && (isCorrect || isSelected)) && (
                    <p className={`text-sm font-medium mt-1 animate-in fade-in slide-in-from-top-1 duration-300 ${variant === 'correct' ? 'text-white/90' : 'text-white/90'}`}>
                      {option.meaning}
                    </p>
                  )}
                </div>
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
            w-full py-5 rounded-[2rem] font-black text-xl transition-all shadow-neo-out
            ${selectedIdx !== null
              ? 'bg-blue-400 text-white hover:scale-[1.02] active:scale-95'
              : 'bg-black/10 dark:bg-white/10 text-foreground/40 cursor-not-allowed shadow-none'}
          `}
        >
          Confirm Answer
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="w-full py-5 rounded-[2rem] font-black text-xl bg-blue-400 text-white hover:scale-[1.02] active:scale-95 shadow-neo-out animate-in fade-in zoom-in duration-500 ring-4 ring-blue-400/30 flex items-center justify-center gap-2 group"
        >
          Continue
        </button>
      )}
    </div>
  );
};
