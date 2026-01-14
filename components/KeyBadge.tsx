import React from 'react';

interface KeyBadgeProps {
  musicalKey: string;
  className?: string;
}

const KeyBadge: React.FC<KeyBadgeProps> = ({ musicalKey, className = '' }) => {
  // Determine color based on key complexity (just for visual flair)
  const isSharpOrFlat = musicalKey.includes('#') || musicalKey.includes('b');
  
  const baseClasses = "inline-flex items-center justify-center px-2.5 py-0.5 rounded font-medium text-xs border";
  const colorClasses = isSharpOrFlat
    ? "bg-indigo-100 text-indigo-800 border-indigo-200"
    : "bg-slate-100 text-slate-800 border-slate-200";

  return (
    <span className={`${baseClasses} ${colorClasses} ${className}`}>
      {musicalKey}
    </span>
  );
};

export default KeyBadge;