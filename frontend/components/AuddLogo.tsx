import React from 'react';

export function AuddLogo({ className = "w-6 h-6", color = "#3814FF" }: { className?: string, color?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path 
        d="M 27.4 74 A 36 36 0 1 1 72.6 74" 
        stroke={color} 
        strokeWidth="8" 
        strokeLinecap="round" 
      />
      <text 
        x="50" 
        y="92" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontSize="22" 
        fontWeight="900" 
        fill={color} 
        textAnchor="middle" 
        letterSpacing="1"
      >
        AUDD
      </text>
      <text 
        x="50" 
        y="60" 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontSize="38" 
        fontWeight="800" 
        fill={color} 
        textAnchor="middle" 
        letterSpacing="-1"
      >
        A$
      </text>
    </svg>
  );
}
