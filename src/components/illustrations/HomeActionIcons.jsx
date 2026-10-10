import React from 'react';

export const SparklesIconPremium = ({ className = "w-full h-full" }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M 50 10 L 55 40 L 90 50 L 55 60 L 50 90 L 45 60 L 10 50 L 45 40 Z" />
        <path d="M 80 20 L 82 30 L 90 32 L 82 34 L 80 45 L 75 34 L 65 32 L 75 30 Z" opacity="0.8" />
        <path d="M 25 70 L 27 75 L 35 77 L 27 79 L 25 85 L 23 79 L 15 77 L 23 75 Z" opacity="0.6" />
    </svg>
);

export const HeroGalleryIconPremium = ({ className = "w-full h-full" }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <circle cx="50" cy="45" r="30" opacity="0.15" />
        <path d="M 25 85 C 25 60 35 55 50 55 C 65 55 75 60 75 85 Z" opacity="0.8" />
        <circle cx="50" cy="32" r="16" />
        <path d="M 32 62 L 50 78 L 68 62 C 73 70 75 80 75 85 L 25 85 C 25 80 27 70 32 62 Z" opacity="0.4" />
        <path d="M 80 20 L 82 25 L 87 27 L 82 29 L 80 34 L 78 29 L 73 27 L 78 25 Z" opacity="0.9" />
        <circle cx="20" cy="30" r="2.5" opacity="0.7" />
    </svg>
);

export const LibraryIconPremium = ({ className = "w-full h-full" }) => (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <rect x="25" y="30" width="20" height="50" rx="3" opacity="0.5" />
        <rect x="50" y="40" width="20" height="40" rx="3" opacity="0.7" />
        <path d="M 68 80 L 88 80 L 68 25 L 48 25 Z" />
        <path d="M 53 35 L 70 35" stroke="currentColor" strokeWidth="3" opacity="0.8" strokeLinecap="round" />
        <path d="M 55 45 L 72 45" stroke="currentColor" strokeWidth="3" opacity="0.8" strokeLinecap="round" />
        <circle cx="45" cy="15" r="3" opacity="0.9" />
        <circle cx="20" cy="40" r="2" opacity="0.7" />
        <circle cx="85" cy="50" r="2.5" opacity="0.8" />
    </svg>
);
