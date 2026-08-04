import React from 'react';

// Minimalist High-Contrast Black & White SVG Illustration of Teddy
export function TeddyIllustration({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <circle cx="28" cy="28" r="14" fill="#fff" stroke="#000" strokeWidth="4" />
      <circle cx="28" cy="28" r="7" fill="#000" />
      <circle cx="72" cy="28" r="14" fill="#fff" stroke="#000" strokeWidth="4" />
      <circle cx="72" cy="28" r="7" fill="#000" />

      {/* Head */}
      <circle cx="50" cy="48" r="32" fill="#fff" stroke="#000" strokeWidth="4" />

      {/* Button Eyes */}
      <circle cx="38" cy="42" r="5" fill="#000" />
      <circle cx="38" cy="42" r="2" fill="#fff" />
      <circle cx="62" cy="42" r="5" fill="#000" />
      <circle cx="62" cy="42" r="2" fill="#fff" />

      {/* Snout & Nose */}
      <ellipse cx="50" cy="56" rx="10" ry="8" fill="#fff" stroke="#000" strokeWidth="3" />
      <ellipse cx="50" cy="53" rx="5" ry="3.5" fill="#000" />
      <path d="M 50 56 L 50 61" stroke="#000" strokeWidth="3" />

      {/* Stitched Mouth */}
      <path d="M 44 61 Q 50 65 56 61" stroke="#000" strokeWidth="3" fill="none" />
    </svg>
  );
}
