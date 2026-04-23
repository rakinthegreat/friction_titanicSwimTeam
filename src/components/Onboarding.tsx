import { Laptop, History, Puzzle, Languages, FlaskConical, Palette, Brain, Leaf } from 'lucide-react';
import { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { Button } from './ui/Button';

const INTEREST_OPTIONS = [
  { id: 'tech', label: 'Technology', icon: Laptop },
  { id: 'history', label: 'History', icon: History },
  { id: 'logic', label: 'Logic Puzzles', icon: Puzzle },
  { id: 'languages', label: 'Languages', icon: Languages },
  { id: 'science', label: 'Science', icon: FlaskConical },
  { id: 'philosophy', label: 'Philosophy', icon: Brain },

];

export default function Onboarding() {
  const [selected, setSelected] = useState<string[]>([]);
  const setInterests = useUserStore((state) => state.setInterests);

  const toggleInterest = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i !== id));
    } else if (selected.length < 5) {
      setSelected([...selected, id]);
    }
  };

  const handleFinish = () => {
    if (selected.length >= 3) {
      setInterests(selected);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-background text-foreground">
      <div className="max-w-md w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tight">Pick your fuel.</h1>
          <p className="text-foreground/50 text-lg font-medium">
            Select 3-5 interests to personalize your reclaimed time.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {INTEREST_OPTIONS.map((interest) => {
            const Icon = interest.icon;
            const isSelected = selected.includes(interest.id);
            return (
              <div
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`flex flex-col items-center justify-center py-8 rounded-3xl transition-all cursor-pointer ${isSelected
                  ? 'shadow-neo-in text-accent scale-95'
                  : 'shadow-neo-out text-foreground/60 hover:scale-[1.02]'
                  }`}
              >
                <Icon size={32} strokeWidth={2.5} className="mb-3" />
                <span className="font-bold text-sm uppercase tracking-wider">{interest.label}</span>
              </div>
            );
          })}
        </div>

        <div className="pt-8">
          <Button
            onClick={handleFinish}
            disabled={selected.length < 3}
            className={`w-full py-5 text-xl font-black shadow-neo-out ${selected.length < 3 ? 'opacity-50' : 'active:shadow-neo-in active:scale-95'}`}
          >
            {selected.length < 3
              ? `Select ${3 - selected.length} more`
              : "Let's Go"}
          </Button>
        </div>
      </div>
    </div>
  );
}

