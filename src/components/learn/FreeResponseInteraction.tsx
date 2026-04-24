import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { getPhilosophyFeedback } from '@/app/learn/philosophy/actions';
import { Loader2, Sparkles, ArrowRight } from 'lucide-react';

interface FreeResponseInteractionProps {
  prompt: string;
  context?: string;
  conceptText?: string;
  conceptName?: string;
  onSubmit: (response: string, feedback: string) => void;
}

export const FreeResponseInteraction = ({ prompt, context, conceptText, conceptName, onSubmit }: FreeResponseInteractionProps) => {
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubmit = async () => {
    if (showFeedback) {
      onSubmit(response, feedback || "");
      return;
    }

    if (response.trim().length > 5) {
      setIsSubmitting(true);
      const result = await getPhilosophyFeedback(
        conceptName || context || "Philosophy",
        conceptText || "",
        prompt,
        response
      );
      
      if (result.success && result.feedback) {
        setFeedback(result.feedback);
        setShowFeedback(true);
      } else {
        // Fallback or skip feedback if it fails
        onSubmit(response, "");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold">{prompt}</h2>
        {context && !showFeedback && (
          <div className="p-4 bg-accent/10 border-l-4 border-accent rounded-r-xl italic text-foreground/80 font-medium">
            "{context}"
          </div>
        )}
      </div>

      {!showFeedback ? (
        <Card className="p-2 shadow-neo-in bg-black/5 dark:bg-white/5 border-none">
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            disabled={isSubmitting}
            placeholder="Type your interpretation here..."
            className="w-full min-h-[150px] p-4 bg-transparent border-none focus:outline-none resize-none text-lg"
          />
        </Card>
      ) : (
        <div className="space-y-4 animate-in fade-in zoom-in duration-500">
          <Card className="p-6 bg-accent-secondary/10 border-2 border-accent-secondary/20 rounded-[2rem] relative overflow-hidden">
            <Sparkles className="absolute -top-4 -right-4 w-24 h-24 text-accent-secondary/10 rotate-12" />
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-accent-secondary text-white rounded-lg">
                <Sparkles size={18} />
              </div>
              <span className="font-black text-accent-secondary uppercase tracking-widest text-xs">AI Insight</span>
            </div>
            <p className="text-lg font-bold leading-relaxed text-foreground/90 italic">
              {feedback}
            </p>
          </Card>
          
          <div className="p-6 bg-card rounded-[2rem] shadow-neo-out opacity-60">
            <p className="text-sm font-medium text-foreground/50 uppercase tracking-widest mb-2">Your Reflection</p>
            <p className="text-foreground/80 line-clamp-3">{response}</p>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={(response.trim().length <= 5) || isSubmitting}
        className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-neo-out flex items-center justify-center gap-3 ${
          response.trim().length > 5 
            ? showFeedback                ? 'bg-[#7EA68B] text-white shadow-neo-in scale-[0.98]' 
                : 'bg-[#7EA68B] text-white hover:scale-[1.02] active:scale-95' 
            : 'bg-black/10 dark:bg-white/10 text-foreground/40 cursor-not-allowed shadow-none'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" />
            <span>Consulting the Oracle...</span>
          </>
        ) : showFeedback ? (
          <>
            <span>Continue Journey</span>
            <ArrowRight size={24} />
          </>
        ) : (
          <span>Check Interpretation</span>
        )}
      </button>
    </div>
  );
};
