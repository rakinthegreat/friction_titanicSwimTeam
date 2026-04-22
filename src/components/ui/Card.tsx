import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className = '', onClick }: CardProps) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-card rounded-3xl transition-all duration-300 ${
        onClick 
          ? 'cursor-pointer shadow-neo-out hover:scale-[1.01] active:shadow-neo-in active:scale-[0.99]' 
          : 'shadow-neo-out'
      } ${className}`}
    >
      {children}
    </div>
  );
};
