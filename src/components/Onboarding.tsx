import { Laptop, History, Puzzle, Languages, FlaskConical, Plane, Landmark, GraduationCap, Megaphone, Newspaper, Search, X as XIcon, Brain, Sun, Moon, ArrowRight, Plus, CheckCircle2, ShieldCheck, Download, Smartphone, Clock } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { useState, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { Button } from './ui/Button';
import { ALL_LANGUAGES } from '@/lib/languages';
import { FRICTION_PRESETS } from '@/lib/friction-presets';

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
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [videoSelected, setVideoSelected] = useState<string[]>([]);
  const [languagesSelected, setLanguagesSelected] = useState<string[]>(['english']);
  const [languageSearch, setLanguageSearch] = useState('');

  const setInterests = useUserStore((state) => state.setInterests);
  const setVideoGenres = useUserStore((state) => state.setVideoGenres);
  const setPreferredLanguages = useUserStore((state) => state.setPreferredLanguages);
  const darkMode = useUserStore((state) => state.preferences.darkMode);
  const setDarkMode = useUserStore((state) => state.setDarkMode);
  const setFrictionPoints = useUserStore((state) => state.setFrictionPoints);

  const [selectedFriction, setSelectedFriction] = useState<string[]>([]);
  const [frictionConfigs, setFrictionConfigs] = useState<Record<string, { start: string, end: string }>>({});
  const [customFrictionData, setCustomFrictionData] = useState({ name: '', start: '09:00', end: '10:00' });
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

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
    } else {
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
    } else if (step === 3 && languagesSelected.length >= 1) {
      setStep(4);
    }
  };

  const toggleFriction = (type: string) => {
    if (selectedFriction.includes(type)) {
      setSelectedFriction(selectedFriction.filter(f => f !== type));
    } else {
      setSelectedFriction([...selectedFriction, type]);
      const preset = FRICTION_PRESETS.find(p => p.type === type);
      if (preset && !frictionConfigs[type]) {
        setFrictionConfigs({
          ...frictionConfigs,
          [type]: { start: preset.defaultStart, end: preset.defaultEnd }
        });
      }
    }
  };

  const updateFrictionTime = (type: string, start: string, end: string) => {
    setFrictionConfigs({
      ...frictionConfigs,
      [type]: { start, end }
    });
  };

  const handleFinish = () => {
    if (languagesSelected.length >= 1) {
      setInterests(selected);
      setVideoGenres(videoSelected);
      setPreferredLanguages(languagesSelected);

      const points = selectedFriction.map(type => {
        const preset = FRICTION_PRESETS.find(p => p.type === type);
        const config = frictionConfigs[type] || { start: preset?.defaultStart || '09:00', end: preset?.defaultEnd || '10:00' };
        return {
          id: Math.random().toString(36).substring(7),
          type: type,
          label: preset?.label || type,
          startTime: config.start,
          endTime: config.end,
          days: [1, 2, 3, 4, 5]
        };
      });

      if (customFrictionData.name) {
        points.push({
          id: Math.random().toString(36).substring(7),
          type: 'custom',
          label: customFrictionData.name,
          startTime: customFrictionData.start,
          endTime: customFrictionData.end,
          days: [1, 2, 3, 4, 5]
        });
      }

      setFrictionPoints(points);
    }
  };

  const filteredLanguages = ALL_LANGUAGES.filter(lang =>
    lang.label.toLowerCase().includes(languageSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 bg-background text-foreground">
      {step === 0 && (
        <div className="max-w-2xl w-full text-left space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="space-y-1">
            <p className={`font-black uppercase tracking-[0.4em] text-xs text-accent`}>Welcome to</p>
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.9]">WaitLess.</h1>
          </div>

          <p className="text-foreground/60 text-xl font-medium leading-relaxed max-w-md">
            Turn life's friction into focused productivity. Reclaim your waiting time with curated learning and activities.
          </p>

          <div className="space-y-4 pt-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Choose your theme</p>
            <div className="flex gap-4 max-w-md">
              <button
                onClick={() => setDarkMode(false)}
                className={`flex-1 p-6 rounded-[2rem] border-2 transition-all text-left group ${!darkMode ? 'border-accent bg-accent/5' : 'border-transparent bg-accent-secondary/5 shadow-neo-out hover:border-accent/20'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${!darkMode ? 'bg-accent text-white' : 'bg-foreground/5 text-foreground/40'}`}>
                  <Sun size={20} />
                </div>
                <span className="font-black uppercase tracking-widest text-xs">Light</span>
              </button>
              <button
                onClick={() => setDarkMode(true)}
                className={`flex-1 p-6 rounded-[2rem] border-2 transition-all text-left group ${darkMode ? 'border-accent bg-accent/5' : 'border-transparent bg-accent-secondary/5 shadow-neo-out hover:border-accent/20'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${darkMode ? 'bg-accent text-white' : 'bg-foreground/5 text-foreground/40'}`}>
                  <Moon size={20} />
                </div>
                <span className="font-black uppercase tracking-widest text-xs">Dark</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={() => setStep(1)}
              variant="primary"
              className="max-w-md w-full py-6 shadow-lg active:scale-95 transition-all rounded-[2rem] flex items-center justify-center gap-4 group"
            >
              <span className="text-4xl font-black tracking-tighter">
                Customize
              </span>
              <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="max-w-xl w-full text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight">Pick your fuel.</h1>
            <p className="text-foreground/50 text-lg font-medium">
              Select your interests to personalize your reclaimed time (minimum 2).
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {INTEREST_OPTIONS.map((interest) => {
              const Icon = interest.icon;
              const isSelected = selected.includes(interest.id);
              return (
                <div
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`flex flex-col items-center justify-center py-8 rounded-3xl transition-all cursor-pointer ${isSelected
                    ? `shadow-neo-in text-accent scale-95`
                    : 'shadow-neo-out text-foreground/60 hover:scale-[1.02]'
                    }`}
                >
                  <Icon size={32} strokeWidth={2.5} className="mb-3" />
                  <span className="font-bold text-sm uppercase tracking-wider">{interest.label}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-8 flex gap-4">
            <Button
              onClick={() => setStep(0)}
              className={`py-5 px-8 font-black shadow-lg bg-background border border-accent/10 hover:bg-accent/5 !text-accent`}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={selected.length < 2}
              variant="primary"
              className={`flex-1 py-5 text-xl font-black shadow-neo-out ${selected.length < 2 ? 'opacity-50' : 'active:shadow-neo-in active:scale-95'}`}
            >
              {selected.length < 2
                ? `Select ${2 - selected.length} more`
                : "Next Step"}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="max-w-xl w-full text-center space-y-12 animate-in slide-in-from-right-8 duration-500">
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tight">Watch & Learn.</h1>
            <p className="text-foreground/50 text-lg font-medium">
              Select your favorite video genres for your downtime.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {VIDEO_GENRES.map((genre) => {
              const Icon = genre.icon;
              const isSelected = videoSelected.includes(genre.id);
              return (
                <div
                  key={genre.id}
                  onClick={() => toggleVideoGenre(genre.id)}
                  className={`flex flex-col items-center justify-center py-8 rounded-3xl transition-all cursor-pointer ${isSelected
                    ? `shadow-neo-in text-accent scale-95`
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
              className={`py-5 px-8 font-black shadow-lg bg-background border border-accent/10 hover:bg-accent/5 !text-accent`}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={videoSelected.length < 1}
              variant="primary"
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
              English is selected by default. Feel free to add more or remove it.
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
                  <div key={id} className={`px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-black flex items-center gap-2 animate-in zoom-in duration-300`}>
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
                      ? `bg-accent text-white scale-[0.98]`
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
              className={`py-5 px-8 font-black shadow-lg bg-background border border-accent/10 hover:bg-accent/5 !text-accent`}
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={languagesSelected.length < 1}
              variant="primary"
              className={`flex-1 py-5 text-xl font-black shadow-neo-out ${languagesSelected.length < 1 ? 'opacity-50' : 'active:shadow-neo-in active:scale-95'}`}
            >
              Next Step
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="max-w-2xl w-full text-center space-y-12 animate-in slide-in-from-right-8 duration-700">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-foreground leading-[0.9]">All set for now.</h1>
            <p className="text-foreground/50 text-xl font-medium max-w-lg mx-auto">
              You're ready to start reclaiming your time.
            </p>
          </div>

          <div className="space-y-8 bg-card p-10 rounded-[3rem] shadow-neo-out border border-white/5 relative overflow-hidden group">
            {/* Platform specific advice */}
            {Capacitor.getPlatform() === 'web' ? (
              <div className="space-y-6 text-left">
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                    <Smartphone size={24} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-black uppercase tracking-wider text-sm">Pro Tip: Go Native</h3>
                    <p className="text-foreground/60 text-sm font-medium leading-relaxed">
                      WaitLess works best on our Android app, where it can automatically detect your waiting periods through activity sensors.
                    </p>
                  </div>
                </div>

                <a
                  href="https://github.com/rakinthegreat/friction_titanicSwimTeam/releases/latest/download/app-release.apk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 bg-foreground text-background rounded-2xl font-black shadow-neo-out hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Download size={20} />
                  DOWNLOAD ANDROID APP
                </a>
              </div>
            ) : (
              <div className="flex gap-4 items-start text-left">
                <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                  <ShieldCheck size={24} />
                </div>
                <div className="space-y-2">
                  <h3 className="font-black uppercase tracking-wider text-sm">Optimize Your Experience</h3>
                  <p className="text-foreground/60 text-sm font-medium leading-relaxed">
                    Head over to your Profile to customize system permissions. This helps WaitLess detect waiting periods more accurately.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4 items-start text-left border-t border-foreground/5 pt-8">
              <div className="p-3 bg-accent-secondary/10 text-accent-secondary rounded-2xl">
                <Clock size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="font-black uppercase tracking-wider text-sm">Customize Friction</h3>
                <p className="text-foreground/60 text-sm font-medium leading-relaxed">
                  You can refine your idle schedules (commute, breaks, etc.) anytime in the profile section to better fit your lifestyle.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <Button
              onClick={() => setStep(3)}
              className={`py-5 px-8 font-black shadow-lg bg-background border border-accent/10 hover:bg-accent/5 !text-accent`}
            >
              Back
            </Button>
            <Button
              onClick={handleFinish}
              variant="primary"
              className={`flex-1 py-5 text-xl font-black shadow-neo-out active:shadow-neo-in active:scale-95`}
            >
              Finish Setup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
