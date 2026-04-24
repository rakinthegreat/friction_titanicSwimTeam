'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { useUserStore } from '@/store/userStore';

import { getDailyWord, getEffectiveDate } from '@/lib/dailyWord';
interface WordData {
  word: string;
  phonetic: string;
  meaning: string;
}

import { getCachedData, setCachedData } from '@/lib/offline-data-manager';

export const WordOfTheDayWidget = () => {
  const addEnglishReviewWord = useUserStore((state) => state.addEnglishReviewWord);
  const [data, setData] = useState<WordData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const CACHE_KEY = 'word_of_day_cache_v2'; // Bump version

    const fetchWordOfTheDay = async () => {
      try {
        const today = getEffectiveDate();
        
        // 1. Check localforage cache first (better than localStorage for Capacitor)
        const cached = await getCachedData<any>(CACHE_KEY);
        if (cached && cached.date === today) {
          setData(cached.data);
          setLoading(false);
          return;
        }

        const word = getDailyWord();
        
        // 2. Fetch dictionary definition
        const defRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        let wordData: WordData;

        if (defRes.ok) {
          const defData = await defRes.json();
          const entry = defData[0];
          wordData = {
            word: word,
            meaning: entry.meanings[0].definitions[0].definition,
            phonetic: entry.phonetic || ''
          };
        } else {
          // Fallback if dictionary API is down or offline
          wordData = {
            word: word,
            meaning: 'A common daily word to help you reclaim your time and focus.',
            phonetic: ''
          };
        }

        setData(wordData);
        await setCachedData(CACHE_KEY, { date: today, data: wordData });
        addEnglishReviewWord(word);
      } catch (error) {
        console.error("Failed to fetch word of the day:", error);
        setData({
          word: 'serendipity',
          meaning: 'the occurrence and development of events by chance in a happy or beneficial way.',
          phonetic: '/ˌserənˈdipədē/'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWordOfTheDay();
  }, []);

  return (
    <Card className="flex flex-col p-6 bg-card border-none shadow-neo-out relative overflow-hidden group mb-12">
      <div className="absolute -left-10 -top-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors" />

      <div className="flex items-center space-x-3 z-10 mb-4 text-foreground/50">
        <BookOpen className="w-5 h-5 text-accent" />
        <span className="font-bold uppercase tracking-widest text-xs text-accent">Word of the Day</span>
      </div>

      <div className="z-10">
        {loading ? (
          <div className="flex items-center space-x-2 text-foreground/50 py-4">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Fetching dictionary...</span>
          </div>
        ) : data ? (
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <h3 className="text-3xl font-black capitalize text-foreground">
                {data.word}
              </h3>
              {data.phonetic && (
                <span className="text-sm font-bold  dark:text-orange-500 font-mono tracking-wide">
                  {data.phonetic}
                </span>
              )}
            </div>
            <p className="text-lg font-medium text-foreground/80 leading-relaxed italic border-l-2 border-accent/30 pl-4 mt-3 py-1">
              "{data.meaning}"
            </p>
          </div>
        ) : (
          <div className="text-foreground/40 text-sm font-medium py-4">
            Dictionary unavailable
          </div>
        )}
      </div>
    </Card>
  );
};
