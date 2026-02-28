import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4'
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-term-bg ${className}`}>
      <div className={`terminal-spinner ${sizeClasses[size]}`}></div>
      <p className="mt-4 text-term-gray text-sm font-mono animate-pulse">Initializing system...</p>
    </div>
  );
};

export default LoadingSpinner;