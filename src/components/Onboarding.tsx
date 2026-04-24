import { Laptop, History, Puzzle, Languages, FlaskConical, Plane, Landmark, GraduationCap, Megaphone, Newspaper, Search, X as XIcon, Brain } from 'lucide-react';
import { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { Button } from './ui/Button';
import { ALL_LANGUAGES } from '@/lib/languages';

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
  const [languagesSelected, setLanguagesSelected] = useState<string[]>([]);
  const [languageSearch, setLanguageSearch] = useState('');
  
  const setInterests = useUserStore((state) => state.setInterests);
  const setVideoGenres = useUserStore((state) => state.setVideoGenres);
  const setPreferredLanguages = useUserStore((state) => state.setPreferredLanguages);

  const toggleInterest = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((i) => i !== id));
    } else {
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

  const toggleLanguage = (id: string) => {
    if (languagesSelected.includes(id)) {
      setLanguagesSelected(languagesSelected.filter((l) => l !== id));
    } else {
      setLanguagesSelected([...languagesSelected, id]);
    }
  };

  const handleNext = () => {
    if (step === 1 && selected.length >= 2) {
      setStep(2);
    } else if (step === 2 && videoSelected.length >= 1) {
      setStep(3);
    }
  };

  const handleFinish = () => {
    if (languagesSelected.length >= 1) {
      setInterests(selected);
      setVideoGenres(videoSelected);
      setPreferredLanguages(languagesSelected);
    }
  };

  const filteredLanguages = ALL_LANGUAGES.filter(lang => 
    lang.label.toLowerCase().includes(languageSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-background text-foreground">
      {step === 1 && (
        <div className="max-w-md w-full text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight">Pick your fuel.</h1>
            <p className="text-foreground/50 text-lg font-medium">
              Select your interests to personalize your reclaimed time (minimum 2).
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
              disabled={selected.length < 2}
              className={`w-full py-5 text-xl font-black shadow-neo-out ${selected.length < 2 ? 'opacity-50' : 'active:shadow-neo-in active:scale-95'}`}
            >
              {selected.length < 2
                ? `Select ${2 - selected.length} more`
                : "Next Step"}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
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
              onClick={handleNext}
              disabled={videoSelected.length < 1}
              className={`flex-1 py-5 text-xl font-black shadow-neo-out ${videoSelected.length < 1 ? 'opacity-50' : 'active:shadow-neo-in active:scale-95'}`}
            >
              Next Step
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-md w-full text-center space-y-8 animate-in slide-in-from-right-8 duration-500">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight">Your Language.</h1>
            <p className="text-foreground/50 text-lg font-medium">
              Choose the languages you prefer for your video content.
            </p>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-accent transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search languages..."
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
              className="w-full bg-card py-4 pl-12 pr-4 rounded-2xl shadow-neo-out focus:shadow-neo-in focus:outline-none transition-all font-bold"
            />
          </div>

          {languagesSelected.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {languagesSelected.map(id => {
                const lang = ALL_LANGUAGES.find(l => l.id === id);
                return (
                  <div key={id} className="px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-black flex items-center gap-2 animate-in zoom-in duration-300">
                    {lang?.label}
                    <XIcon size={14} className="cursor-pointer" onClick={() => toggleLanguage(id)} />
                  </div>
                );
              })}
            </div>
          )}

          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar shadow-neo-in rounded-3xl p-4">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => {
                const isSelected = languagesSelected.includes(lang.id);
                return (
                  <div
                    key={lang.id}
                    onClick={() => toggleLanguage(lang.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer ${isSelected
                      ? 'bg-accent text-white scale-[0.98]'
                      : 'hover:bg-foreground/5 text-foreground/60'
                      }`}
                  >
                    <span className="font-bold text-sm uppercase tracking-wider">{lang.label}</span>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                  </div>
                );
              })
            ) : (
              <p className="py-8 text-foreground/30 font-bold">No languages found.</p>
            )}
          </div>

          <div className="pt-4 flex gap-4">
            <Button
              onClick={() => setStep(2)}
              className="py-5 px-6 font-black shadow-neo-out bg-background text-foreground hover:bg-foreground/5"
            >
              Back
            </Button>
            <Button
              onClick={handleFinish}
              disabled={languagesSelected.length < 1}
              className={`flex-1 py-5 text-xl font-black shadow-neo-out ${languagesSelected.length < 1 ? 'opacity-50' : 'active:shadow-neo-in active:scale-95'}`}
            >
              {languagesSelected.length < 1 ? "Select at least 1" : "Let's Go"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
