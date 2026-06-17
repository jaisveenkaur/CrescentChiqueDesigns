'use client';

import React from 'react';

// Reusable Gold Foil Gradient Definition for SVGs
export const GoldFoilGradient = () => (
  <defs>
    <linearGradient id="gold-foil" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#F3E7C4" />
      <stop offset="20%" stopColor="#D4AF37" />
      <stop offset="40%" stopColor="#AA7C11" />
      <stop offset="60%" stopColor="#D4AF37" />
      <stop offset="80%" stopColor="#E6C687" />
      <stop offset="100%" stopColor="#C9A36B" />
    </linearGradient>
    <linearGradient id="gold-foil-light" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#E6C687" />
      <stop offset="50%" stopColor="#D4AF37" />
      <stop offset="100%" stopColor="#C9A36B" />
    </linearGradient>
  </defs>
);

interface LogoProps {
  variant?: 'primary' | 'monogram' | 'gold-foil' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ variant = 'primary', className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-10',
    md: 'h-14',
    lg: 'h-20',
  };

  const currentSize = sizeClasses[size];

  if (variant === 'monogram') {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`${currentSize} ${className} select-none`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <GoldFoilGradient />
        {/* Outer Elegant Ring/Crescent */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="url(#gold-foil)"
          strokeWidth="1.5"
          strokeDasharray="280 40"
          className="animate-[spin_40s_linear_infinite]"
        />
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="url(#gold-foil)"
          strokeWidth="0.5"
          strokeOpacity="0.5"
        />
        
        {/* Intersecting CC Serif Lettering */}
        <text
          x="38"
          y="62"
          fontFamily="var(--font-playfair), Playfair Display, serif"
          fontSize="38"
          fontWeight="300"
          fill="url(#gold-foil)"
          letterSpacing="-0.05em"
        >
          C
        </text>
        <text
          x="48"
          y="62"
          fontFamily="var(--font-playfair), Playfair Display, serif"
          fontSize="38"
          fontWeight="300"
          fill="url(#gold-foil)"
          letterSpacing="-0.05em"
        >
          C
        </text>
      </svg>
    );
  }

  if (variant === 'gold-foil') {
    return (
      <div className={`flex items-center gap-3.5 ${className} select-none`}>
        {/* Elegant Crescent Symbol */}
        <svg viewBox="0 0 100 100" className="h-10 w-10 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
          <GoldFoilGradient />
          <path
            d="M65 80C42.9 80 25 62.1 25 40C25 22.5 36.2 7.3 53 1.5C32.8 5 17.8 22.7 17.8 44C17.8 67.8 37.2 87 61 87C73.1 87 84 80.2 90 70C83.7 76.5 75.1 80 65 80Z"
            fill="url(#gold-foil)"
          />
        </svg>
        <div className="flex flex-col text-left">
          <span
            className="font-serif tracking-[0.08em] text-lg font-light leading-none"
            style={{
              background: 'linear-gradient(135deg, #F3E7C4 0%, #D4AF37 50%, #C9A36B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Crescent Chique
          </span>
          <span
            className="font-sans tracking-[0.3em] text-[8px] font-semibold uppercase mt-1 text-gold/85"
          >
            INTERIOR DESIGNS
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'dark') {
    return (
      <div className={`flex items-center gap-3 ${className} select-none`}>
        {/* Dark navy square logo container */}
        <div className="h-11 w-11 bg-[#171d28] rounded-[8px] border border-white/10 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 100 100" className="h-6.5 w-6.5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M65 80C42.9 80 25 62.1 25 40C25 22.5 36.2 7.3 53 1.5C32.8 5 17.8 22.7 17.8 44C17.8 67.8 37.2 87 61 87C73.1 87 84 80.2 90 70C83.7 76.5 75.1 80 65 80Z"
              fill="#D4AF37"
            />
          </svg>
        </div>
        <div className="flex flex-col text-left">
          <span className="font-serif tracking-[0.08em] text-lg font-medium leading-none text-white">
            Crescent Chique
          </span>
          <span className="font-sans tracking-[0.25em] text-[10px] font-bold uppercase mt-1 text-[#D4AF37]">
            INTERIOR DESIGNS
          </span>
        </div>
      </div>
    );
  }

  // Default Primary Logo
  return (
    <div className={`flex items-center gap-3 ${className} select-none`}>
      {/* Dark navy square logo container */}
      <div className="h-11 w-11 bg-[#171d28] rounded-[8px] border border-white/10 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 100 100" className="h-6.5 w-6.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M65 80C42.9 80 25 62.1 25 40C25 22.5 36.2 7.3 53 1.5C32.8 5 17.8 22.7 17.8 44C17.8 67.8 37.2 87 61 87C73.1 87 84 80.2 90 70C83.7 76.5 75.1 80 65 80Z"
            fill="#D4AF37"
          />
        </svg>
      </div>
      <div className="flex flex-col text-left">
        <span className="font-serif tracking-[0.08em] text-lg font-semibold leading-none text-charcoal">
          Crescent Chique
        </span>
        <span className="font-sans tracking-[0.25em] text-[10px] font-bold uppercase mt-1 text-gold-dark">
          INTERIOR DESIGNS
        </span>
      </div>
    </div>
  );
};

// Reusable Background Pattern - Signature Gold Lines
export const GoldPattern: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden opacity-[0.04] ${className}`}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#D4AF37" strokeWidth="1" />
            <circle cx="0" cy="0" r="1.5" fill="#D4AF37" />
            <circle cx="80" cy="0" r="1.5" fill="#D4AF37" />
            <circle cx="0" cy="80" r="1.5" fill="#D4AF37" />
            <circle cx="80" cy="80" r="1.5" fill="#D4AF37" />
            {/* Fine architectural diagonal line */}
            <path d="M 0 80 L 80 0" fill="none" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="3, 3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
};

// Luxury Divider Component
export const LuxuryDivider: React.FC<{ className?: string; color?: 'gold' | 'charcoal' | 'ivory' }> = ({ 
  className = '', 
  color = 'gold' 
}) => {
  const lineColor = color === 'ivory' ? 'border-beige-soft/20' : 'border-gold/15';

  return (
    <div className={`flex items-center justify-center w-full my-16 gap-6 ${className}`}>
      <div className={`flex-1 border-t ${lineColor} border-double h-[3px]`} />
      <div className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-beige-soft/40 backdrop-blur rounded-full border border-gold/10">
        <svg viewBox="0 0 100 100" className="h-5 w-5 fill-none" xmlns="http://www.w3.org/2000/svg">
          <GoldFoilGradient />
          <path
            d="M50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C61.5 85 71.5 79.5 77.5 71C66 76 53.5 74 45 65.5C36.5 57 34.5 44.5 39.5 33C31 39 25.5 49 25.5 50C25.5 63.53 36.47 74.5 50 74.5C61.5 74.5 71 67.5 74.5 57.5C71 59.5 67 60.5 63 60.5C51.68 60.5 42.5 51.32 42.5 40C42.5 31.5 47.5 24.5 55 21C53.3 20.7 51.7 20.5 50 15Z"
            fill="url(#gold-foil)"
          />
        </svg>
        <span className="font-serif text-[10px] tracking-[0.25em] font-medium text-gold-dark select-none mt-0.5">CC</span>
      </div>
      <div className={`flex-1 border-t ${lineColor} border-double h-[3px]`} />
    </div>
  );
};

// Decorative Editorial Accents
export const EditorialAccent: React.FC<{ position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; className?: string }> = ({
  position = 'top-left',
  className = ''
}) => {
  const positionClasses = {
    'top-left': 'top-6 left-6 border-t border-l',
    'top-right': 'top-6 right-6 border-t border-r',
    'bottom-left': 'bottom-6 left-6 border-b border-l',
    'bottom-right': 'bottom-6 right-6 border-b border-r'
  };

  return (
    <div 
      className={`absolute w-8 h-8 border-gold/25 pointer-events-none ${positionClasses[position]} ${className}`}
      style={{ borderWidth: '1px' }}
    />
  );
};
