'use client';

import React, { useState, useMemo } from 'react';
import { LessonProgressBar } from '@/components/learn/LessonProgressBar';
import { FreeResponseInteraction } from '@/components/learn/FreeResponseInteraction';
import { MCQInteraction } from '@/components/learn/MCQInteraction';
import { Card } from '@/components/ui/Card';
import { FlaskConical, Trophy, Loader2, BookOpen, History, Sparkles, ChevronLeft, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { concepts } from '@/app/learn/science/topics';
import { useUserStore } from '@/store/userStore';
import { generateScienceConcepts, getScienceFeedback } from '@/app/learn/science/actions';

type Step =
  | { type: 'concept'; title: string; description: string; conceptName: string; }
  | { type: 'mcq'; question: string; options: any[]; conceptName: string; }
  | { type: 'interpret'; prompt: string; context: string; conceptName: string; description: string; };

export default function ScienceModule() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const completeScienceConcept = useUserStore(state => state.completeScienceConcept);
  const addCustomScienceConcepts = useUserStore(state => state.addCustomScienceConcepts);
  const addScienceReflection = useUserStore(state => state.addScienceReflection);
  const scienceReflections = useUserStore(state => state.scienceReflections);
  const interests = useUserStore(state => state.interests);

  const [viewMode, setViewMode] = useState<'menu' | 'learn' | 'review'>('menu');
  const [currentSessionMCQs, setCurrentSessionMCQs] = useState<any[]>([]);
  const [sessionConcepts, setSessionConcepts] = useState<any[]>([]);

  React.useEffect(() => {
    setMounted(true);
    const state = useUserStore.getState();
    const completed = state.completedScienceConcepts || [];
    const allConcepts = [...concepts, ...(state.customScienceConcepts || [])];
    setSessionConcepts(allConcepts.filter(c => !completed.includes(c.concept_name)));
  }, []);

  const lessonData = useMemo(() => {
    return sessionConcepts.flatMap(concept => [
      {
        type: 'concept' as const,
        title: concept.concept_name,
        description: concept.concept_text,
        conceptName: concept.concept_name
      },
      {
        type: 'mcq' as const,
        question: (concept as any)["question 1"].question_body,
        options: (concept as any)["question 1"].options,
        conceptName: concept.concept_name
      },
      {
        type: 'mcq' as const,
        question: (concept as any)["question 2"].question_body,
        options: (concept as any)["question 2"].options,
        conceptName: concept.concept_name
      },
      {
        type: 'interpret' as const,
        prompt: (concept as any)["question 3"].question_body,
        context: concept.concept_name,
        conceptName: concept.concept_name,
        description: concept.concept_text
      }
    ]);
  }, [sessionConcepts]);

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleSkip = () => {
    completeScienceConcept(currentStep.conceptName);
    const nextConceptIndex = lessonData.findIndex((step, idx) => idx > currentIndex && step.type === 'concept');
    if (nextConceptIndex !== -1) {
      setCurrentIndex(nextConceptIndex);
    } else {
      setCurrentIndex(lessonData.length);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    const state = useUserStore.getState();
    const result = await generateScienceConcepts(interests, state.completedScienceConcepts);

    if (result.success && result.concepts) {
      addCustomScienceConcepts(result.concepts);
      setSessionConcepts(result.concepts);
      setCurrentIndex(0);
    } else {
      setError(result.error || "Failed to generate concepts.");
    }
    setIsGenerating(false);
  };

  const currentStep = lessonData[currentIndex];

  if (!mounted) return null;

  if (viewMode === 'menu') {
    return (
      <main className="min-h-screen max-w-4xl mx-auto p-6 flex flex-col justify-center space-y-12 animate-in fade-in duration-700">
        <div className="space-y-4 text-center">
          <h1 className="text-6xl font-black tracking-tighter text-foreground italic">
            The <span className="text-blue-500">Laboratory</span>
          </h1>
          <p className="text-xl text-foreground/60 font-medium max-w-xl mx-auto">
            Explore the fundamental laws of nature and the cutting-edge discoveries of the modern era.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            onClick={() => {
              setCurrentIndex(0);
              setCurrentSessionMCQs([]);
              setViewMode('learn');
            }}
            className="group relative p-1 rounded-[3rem] bg-gradient-to-br from-blue-500 to-cyan-500 transition-all hover:scale-[1.02] active:scale-95 shadow-neo-out"
          >
            <div className="bg-card rounded-[2.8rem] p-10 h-full flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-blue-500/10 text-blue-500 rounded-3xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <BookOpen size={40} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-3xl font-black mb-2">Start Discovery</h2>
                <p className="text-foreground/60 font-bold">Explore 10 scientific concepts tailored to your interests.</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setViewMode('review')}
            className="group relative p-1 rounded-[3rem] bg-black/5 dark:bg-white/5 transition-all hover:scale-[1.02] active:scale-95 shadow-neo-out"
          >
            <div className="bg-card rounded-[2.8rem] p-10 h-full flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-foreground/5 text-foreground/40 rounded-3xl flex items-center justify-center group-hover:-rotate-12 transition-transform">
                <History size={40} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-3xl font-black mb-2">Review Findings</h2>
                <p className="text-foreground/60 font-bold">Revisit your past experiments and AI-guided insights.</p>
              </div>
              {scienceReflections.length > 0 && (
                <div className="px-4 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs font-black uppercase tracking-widest">
                  {scienceReflections.length} Findings Logged
                </div>
              )}
            </div>
          </button>
        </div>

        <button
          onClick={() => router.push('/learn')}
          className="mx-auto flex items-center gap-2 text-foreground/40 hover:text-foreground transition-colors font-black uppercase tracking-widest text-sm"
        >
          <ChevronLeft size={20} />
          Back to Hub
        </button>
      </main>
    );
  }

  if (viewMode === 'review') {
    return (
      <main className="min-h-screen max-w-3xl mx-auto p-6 flex flex-col space-y-8 animate-in slide-in-from-right-8 duration-500">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewMode('menu')}
            className="p-4 bg-card rounded-2xl shadow-neo-out hover:scale-105 active:scale-95 transition-all"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-3xl font-black tracking-tighter">Research Log</h1>
          <div className="w-12" /> {/* Spacer */}
        </div>

        {scienceReflections.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 opacity-50">
            <History size={80} strokeWidth={1} />
            <p className="text-xl font-bold">No findings logged yet.</p>
            <button
              onClick={() => setViewMode('learn')}
              className="px-8 py-4 bg-blue-500 text-white rounded-2xl font-black shadow-neo-out hover:scale-105 transition-all"
            >
              Begin Research
            </button>
          </div>
        ) : (
          <div className="space-y-12 pb-20">
            {scienceReflections.map((ref, idx) => (
              <div key={idx} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-foreground/10" />
                  <div className="flex items-center gap-2 text-foreground/40 font-black uppercase tracking-widest text-xs">
                    <Calendar size={14} />
                    {new Date(ref.timestamp).toLocaleDateString()}
                  </div>
                  <div className="h-px flex-1 bg-foreground/10" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest">{ref.conceptName}</h3>
                    <div className="p-4 bg-card rounded-2xl shadow-neo-in opacity-60">
                      <p className="text-sm font-medium leading-relaxed text-foreground/70">{ref.conceptText}</p>
                    </div>
                  </div>

                  {/* MCQ Results */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ref.mcqs.map((mcq, mIdx) => (
                      <Card key={mIdx} className={`p-4 border-none shadow-neo-out rounded-2xl ${mcq.isCorrect ? 'bg-[#7EA68B]/10' : 'bg-[#DC2626]/10'}`}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30 mb-2">Hypothesis {mIdx + 1}</p>
                        <p className="text-sm font-bold mb-3 line-clamp-2">{mcq.question}</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${mcq.isCorrect ? 'bg-accent' : 'bg-red-600'}`} />
                            <p className="text-xs font-bold truncate">You: {mcq.userAnswer}</p>
                          </div>
                          {!mcq.isCorrect && (
                             <p className="text-[10px] font-black text-[#7EA68B] uppercase ml-4">Correct: {mcq.correctAnswer}</p>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-2">Observation: {ref.reflection.question}</p>
                      <Card className="p-6 bg-card border-none shadow-neo-in opacity-80">
                        <p className="text-sm font-black text-foreground/30 uppercase tracking-widest mb-2">Your Conclusion</p>
                        <p className="text-lg font-bold text-foreground/70 leading-relaxed italic">"{ref.reflection.answer}"</p>
                      </Card>
                    </div>

                    <Card className="p-6 bg-blue-500/5 border-2 border-blue-500/10 rounded-[3rem] relative overflow-hidden">
                      <Sparkles className="absolute -top-6 -right-6 w-32 h-32 text-blue-500/5 rotate-12" />
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-1.5 bg-blue-500 text-white rounded-lg">
                          <Sparkles size={14} />
                        </div>
                        <span className="font-black text-blue-500 uppercase tracking-widest text-[10px]">AI Feedback</span>
                      </div>
                      <p className="text-lg font-bold text-foreground/90 leading-relaxed">
                        {ref.reflection.feedback}
                      </p>
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    );
  }

  if (sessionConcepts.length === 0) {
    return (
      <main className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col justify-center items-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="w-32 h-32 bg-blue-500/20 text-blue-500 rounded-[2.5rem] flex items-center justify-center shadow-neo-out relative overflow-hidden">
          {isGenerating ? (
            <Loader2 className="w-16 h-16 animate-spin" />
          ) : (
            <Trophy className="w-16 h-16" />
          )}
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight">
            {isGenerating ? "Synthesizing Data..." : "Lead Researcher"}
          </h1>
          <p className="text-foreground/70 text-lg font-medium max-w-md">
            {isGenerating
              ? "Our AI is analyzing the scientific landscape to bring you 5 brand new discoveries."
              : "You've explored every concept in our current lab. You're a true scientific pioneer!"}
          </p>
          {error && <p className="text-red-500 font-bold mt-4">{error}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`px-8 py-5 rounded-2xl font-black text-xl shadow-neo-out transition-all ${isGenerating ? 'bg-card text-foreground/50 opacity-50 cursor-not-allowed' : 'bg-blue-500 text-white hover:scale-105 active:scale-95'
              }`}
          >
            {isGenerating ? 'Analyzing...' : 'Generate New Discoveries'}
          </button>
          {!isGenerating && (
            <button
              onClick={() => {
                setCurrentIndex(0);
                setCurrentSessionMCQs([]);
                setViewMode('menu');
              }}
              className="px-8 py-5 bg-card text-foreground rounded-2xl font-black text-xl shadow-neo-out hover:scale-105 active:scale-95 transition-all"
            >
              Return to Lab
            </button>
          )}
        </div>
      </main>
    );
  }

  if (currentIndex >= lessonData.length) {
    return (
      <main className="min-h-screen max-w-2xl mx-auto p-6 flex flex-col justify-center items-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="w-32 h-32 bg-[#7EA68B]/20 text-[#7EA68B] rounded-[2.5rem] flex items-center justify-center shadow-neo-out border-2 border-[#7EA68B]/20">
          <Trophy className="w-16 h-16" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black tracking-tight">Research Complete</h1>
          <p className="text-foreground/70 text-lg font-medium max-w-md">
            You've logged {sessionConcepts.length} new discoveries in this session.
          </p>
        </div>
        <button
          onClick={() => {
            setCurrentIndex(0);
            setCurrentSessionMCQs([]);
            setViewMode('menu');
          }}
          className="w-full sm:w-auto px-12 py-5 bg-blue-500 text-white rounded-2xl font-black text-xl shadow-neo-out hover:scale-105 active:scale-95 transition-all"
        >
          Return to Lab
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen max-w-2xl mx-auto p-4 flex flex-col">
      <div className="pt-4 px-2 flex items-center gap-4">
        <button onClick={() => {
          setCurrentIndex(0);
          setCurrentSessionMCQs([]);
          setViewMode('menu');
        }} className="p-2 hover:bg-card rounded-xl transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <LessonProgressBar current={currentIndex} total={lessonData.length} />
        </div>
      </div>

      <div className="flex-1 mt-8 pb-12 px-2">
        {currentStep.type === 'concept' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            <div className="space-y-2 text-center">
              <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.2em]">
                Scientific Discovery
              </h2>
              <h3 className="text-5xl font-black tracking-tighter text-foreground">{currentStep.title}</h3>
            </div>

            <Card className="p-8 space-y-6 border-none bg-card shadow-neo-out relative overflow-hidden rounded-[3rem]">
              <FlaskConical className="absolute -top-10 -right-10 w-48 h-48 text-blue-500/5 rotate-12" />
              <p className="text-xl font-bold leading-relaxed text-foreground/80 relative z-10">
                {currentStep.description}
              </p>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={handleSkip}
                className="w-full sm:w-1/3 py-5 rounded-3xl font-black text-xl bg-card text-foreground/50 shadow-neo-out hover:scale-[1.02] active:scale-95 transition-all"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="w-full sm:w-2/3 py-5 rounded-3xl font-black text-xl bg-blue-500 text-white shadow-neo-out hover:scale-[1.02] active:scale-95 transition-all"
              >
                Continue Research
              </button>
            </div>
          </div>
        )}

        {currentStep.type === 'mcq' && (
          <MCQInteraction
            question={currentStep.question}
            options={currentStep.options}
            manualConfirm={true}
            onSubmit={(isCorrect, selected, correct) => {
              setCurrentSessionMCQs(prev => [
                ...prev,
                {
                  question: currentStep.question,
                  userAnswer: selected,
                  correctAnswer: correct,
                  isCorrect: isCorrect
                }
              ]);
              handleNext();
            }}
          />
        )}

        {currentStep.type === 'interpret' && (
          <FreeResponseInteraction
            prompt={currentStep.prompt}
            context={currentStep.context}
            conceptName={currentStep.conceptName}
            conceptText={currentStep.description}
            onSubmit={async (resp, feedback) => {
              addScienceReflection({
                conceptName: currentStep.conceptName,
                conceptText: currentStep.description,
                mcqs: currentSessionMCQs,
                reflection: {
                  question: currentStep.prompt,
                  answer: resp,
                  feedback: feedback
                }
              });
              setCurrentSessionMCQs([]);
              completeScienceConcept(currentStep.conceptName);
              handleNext();
            }}
          />
        )}
      </div>
    </main>
  );
}
