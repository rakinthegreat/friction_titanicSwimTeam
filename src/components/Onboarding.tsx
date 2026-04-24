import { Laptop, History, Puzzle, Languages, FlaskConical, Palette, Brain, Leaf, Plane, Landmark, GraduationCap, Megaphone, Newspaper } from 'lucide-react';
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

const VIDEO_GENRES = [
  { id: 'Travel', label: 'Travel', icon: Plane },
  { id: 'History', label: 'History', icon: Landmark },
  { id: 'Educational', label: 'Educational', icon: GraduationCap },
  { id: 'Politics', label: 'Politics', icon: Megaphone },
  { id: 'News', label: 'News', icon: Newspaper },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [videoSelected, setVideoSelected] = useState<string[]>([]);
  const setInterests = useUserStore((state) => state.setInterests);
  const setVideoGenres = useUserStore((state) => state.setVideoGenres);

  const toggleInterest = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const toggleVideoGenre = (id: string) => {
    if (videoSelected.includes(id)) {
      setVideoSelected(videoSelected.filter((i) => i !== id));
    } else if (videoSelected.length < 3) {
      setVideoSelected([...videoSelected, id]);
    }
  };

  const handleNext = () => {
    if (selected.length >= 3) {
      setStep(2);
    }
  };

  const handleFinish = () => {
    if (videoSelected.length >= 1) {
      setInterests(selected);
      setVideoGenres(videoSelected);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-background text-foreground">
      {step === 1 ? (
        <div className="max-w-md w-full text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight">Pick your fuel.</h1>
            <p className="text-foreground/50 text-lg font-medium">
              Select your interests to personalize your reclaimed time (Maximum 3).
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
              onClick={handleNext}
              disabled={selected.length < 3}
              className={`w-full py-5 text-xl font-black shadow-neo-out ${selected.length < 3 ? 'opacity-50' : 'active:shadow-neo-in active:scale-95'}`}
            >
              {selected.length < 3
                ? `Select ${3 - selected.length} more`
                : "Next Step"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-md w-full text-center space-y-12 animate-in slide-in-from-right-8 duration-500">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight">Watch & Learn.</h1>
            <p className="text-foreground/50 text-lg font-medium">
              Select your favorite video genres for your downtime (Maximum 3).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {VIDEO_GENRES.map((genre) => {
              const Icon = genre.icon;
              const isSelected = videoSelected.includes(genre.id);
              return (
                <div
                  key={genre.id}
                  onClick={() => toggleVideoGenre(genre.id)}
                  className={`flex flex-col items-center justify-center py-8 rounded-3xl transition-all cursor-pointer ${isSelected
                    ? 'shadow-neo-in text-accent scale-95'
                    : 'shadow-neo-out text-foreground/60 hover:scale-[1.02]'
                    }`}
                >
                  <Icon size={32} strokeWidth={2.5} className="mb-3" />
                  <span className="font-bold text-sm uppercase tracking-wider">{genre.label}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-8 flex gap-4">
            <Button
              onClick={() => setStep(1)}
              className="py-5 px-6 font-black shadow-neo-out bg-background text-foreground hover:bg-foreground/5"
            >
              Back
            </Button>
            <Button
              onClick={handleFinish}
              disabled={videoSelected.length < 1}
              className={`flex-1 py-5 text-xl font-black shadow-neo-out ${videoSelected.length < 1 ? 'opacity-50' : 'active:shadow-neo-in active:scale-95'}`}
            >
              {videoSelected.length < 1 ? "Select at least 1" : "Let's Go"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

