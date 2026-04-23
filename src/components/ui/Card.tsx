import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  const isClickable = !!props.onClick;
  
  return (
    <div 
      {...props}
      className={`bg-card rounded-3xl transition-all duration-300 ${
        isClickable 
          ? 'cursor-pointer shadow-neo-out hover:scale-[1.01] active:shadow-neo-in active:scale-[0.99]' 
          : 'shadow-neo-out'
      } ${className}`}
    >
      {children}
    </div>
  );
};
