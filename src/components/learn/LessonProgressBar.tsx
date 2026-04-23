import React from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LessonProgressBarProps {
  current: number;
  total: number;
  onClose?: () => void;
}

export const LessonProgressBar = ({ current, total, onClose }: LessonProgressBarProps) => {
  const router = useRouter();
  const progress = Math.min(100, Math.max(0, (current / total) * 100));

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.push('/learn');
    }
  };

  return (
    <div className="flex items-center gap-4 w-full px-4 py-6">
      <button 
        onClick={handleClose}
        className="text-foreground/40 hover:text-foreground transition-colors p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
      >
        <X className="w-6 h-6" />
      </button>
      <div className="flex-1 h-4 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden shadow-neo-in">
        <div 
          className="h-full bg-green-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
