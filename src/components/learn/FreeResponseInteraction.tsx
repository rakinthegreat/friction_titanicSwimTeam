import React, { useState } from 'react';
import { Card } from '../ui/Card';

interface FreeResponseInteractionProps {
  prompt: string;
  context?: string;
  onSubmit: (response: string) => void;
}

export const FreeResponseInteraction = ({ prompt, context, onSubmit }: FreeResponseInteractionProps) => {
  const [response, setResponse] = useState('');

  const handleSubmit = () => {
    if (response.trim().length > 5) {
      onSubmit(response);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold">{prompt}</h2>
        {context && (
          <div className="p-4 bg-accent/10 border-l-4 border-accent rounded-r-xl italic text-foreground/80 font-medium">
            "{context}"
          </div>
        )}
      </div>

      <Card className="p-2 shadow-neo-in bg-black/5 dark:bg-white/5 border-none">
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your interpretation here..."
          className="w-full min-h-[150px] p-4 bg-transparent border-none focus:outline-none resize-none text-lg"
        />
      </Card>

      <button
        onClick={handleSubmit}
        disabled={response.trim().length <= 5}
        className={`w-full py-4 rounded-2xl font-black text-xl transition-all shadow-neo-out ${
          response.trim().length > 5 
            ? 'bg-green-500 text-white hover:scale-[1.02] active:scale-95' 
            : 'bg-black/10 dark:bg-white/10 text-foreground/40 cursor-not-allowed shadow-none'
        }`}
      >
        Continue
      </button>
    </div>
  );
};
