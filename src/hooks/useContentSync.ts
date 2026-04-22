'use client';

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { useContentStore } from '@/store/contentStore';
import { generateContent } from '@/lib/gemini';

export const useContentSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const interests = useUserStore((state) => state.interests);
  const { lastFetched, setContent } = useContentStore();

  useEffect(() => {
    const sync = async () => {
      if (interests.length === 0) return;

      const fiveDaysInMs = 5 * 24 * 60 * 60 * 1000;
      const isExpired = !lastFetched || (Date.now() - lastFetched > fiveDaysInMs);

      if (isExpired && !isSyncing) {
        setIsSyncing(true);
        console.log("Syncing fresh content from Gemini...");
        try {
          const content = await generateContent(interests);
          if (content) {
            setContent(content);
          }
        } catch (error) {
          console.error("Sync failed:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    sync();
  }, [interests, lastFetched, setContent, isSyncing]);

  return { isSyncing };
};
