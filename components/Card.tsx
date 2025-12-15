import React from 'react';

interface CardProps {
  label: string;
  // Common props
  betAmount?: number;
  winner?: boolean;
  loser?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
  domId?: string; // ID for animation targeting
  
  // Visual Configuration
  variant?: 'poker' | 'tile';
  hideCentralIcon?: boolean;
  simpleRankOnly?: boolean; 
  compact?: boolean; 
  
  // Poker Variant Props
  suit?: '♥' | '♦' | '♣' | '♠';
  rank?: string;
  
  // Tile/Icon Variant Props
  icon?: string;
  colorFrom?: string; // Gradient start
  colorTo?: string;   // Gradient end
}

export const Card: React.FC<CardProps> = ({ 
  label, 
  betAmount = 0,
  winner, 
  loser,
  onClick, 
  disabled,
  className = '',
  domId,
  variant = 'tile',
  hideCentralIcon = false,
  simpleRankOnly = false,
  compact = false,
  suit = '♠',
  rank = 'A',
  icon,
  colorFrom = 'from-slate-700',
  colorTo = 'to-slate-800'
}) => {
  const isRed = suit === '♥' || suit === '♦';
  const suitColor = isRed ? 'text-red-600' : 'text-slate-900';
  
  // Base classes
  let containerClasses = `
    relative flex flex-col items-center justify-center 
    rounded-xl select-none cursor-pointer
    transition-all duration-300 ease-out
    w-full overflow-hidden
    ${className}
  `;

  // Dynamic Styles based on state
  let stateStyles = "";
  let shadowStyles = "shadow-lg";

  if (winner) {
    stateStyles = "z-20 scale-105 ring-4 ring-green-400 shadow-[0_0_30px_rgba(74,222,128,0.5)]";
  } else if (loser) {
    stateStyles = "opacity-40 grayscale scale-95";
  } else if (disabled) {
    stateStyles = "opacity-80 cursor-not-allowed";
  } else {
    // Idle / Hover
    stateStyles = "hover:-translate-y-1 hover:brightness-110 active:scale-95";
  }

  // Betting Overlay
  const BetBadge = () => (
     betAmount > 0 ? (
        <div className="absolute top-1 right-1 z-30 animate-[bounce-small_0.3s_ease-out]">
            <div className={`bg-yellow-500 text-black border-2 border-white rounded-full flex items-center justify-center shadow-lg ${compact ? 'min-w-[20px] h-5 px-1' : 'min-w-[24px] h-6 px-1.5'}`}>
                <span className={`${compact ? 'text-[9px]' : 'text-[10px]'} font-black leading-none tracking-tighter`}>
                    {betAmount >= 1000 ? (betAmount/1000).toFixed(1).replace('.0','') + 'k' : betAmount}
                </span>
            </div>
        </div>
     ) : null
  );

  // --- RENDER POKER CARD VARIANT ---
  if (variant === 'poker') {
    // Sizes based on compact mode
    const cornerRankSize = compact ? "text-xs font-bold" : "text-lg md:text-xl font-black";
    const cornerSuitSize = compact ? "text-[10px]" : "text-sm md:text-lg";
    const centerSuitSize = compact ? "text-3xl md:text-4xl" : "text-6xl md:text-8xl";
    const cornerPosTop = compact ? "top-1 left-1" : "top-2 left-2";
    const cornerPosBottom = compact ? "bottom-1 right-1" : "bottom-2 right-2";

    // Use thinner border for compact cards
    const borderClass = compact ? 'border-2' : 'border-4';

    return (
      <button
        id={domId}
        onClick={onClick}
        disabled={disabled}
        className={`
          ${containerClasses}
          bg-gray-100 ${borderClass} ${winner ? 'border-green-500' : 'border-white'} 
          ${stateStyles}
          ${shadowStyles}
        `}
      >
        <BetBadge />
        
        {/* Card Pattern Texture */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-transparent"></div>

        {/* --- CORNER INDICES --- */}
        {!simpleRankOnly && (
            <>
                {/* Top Left Corner */}
                <div className={`absolute ${cornerPosTop} flex flex-col items-center leading-none ${suitColor}`}>
                    <span className={`${cornerRankSize} font-serif`}>{rank}</span>
                    <span className={cornerSuitSize}>{suit}</span>
                </div>

                {/* Bottom Right Corner (Inverted) */}
                <div className={`absolute ${cornerPosBottom} flex flex-col items-center leading-none rotate-180 ${suitColor}`}>
                    <span className={`${cornerRankSize} font-serif`}>{rank}</span>
                    <span className={cornerSuitSize}>{suit}</span>
                </div>
            </>
        )}

        {/* --- CENTER CONTENT --- */}
        {simpleRankOnly ? (
            // Simple Mode: Just the Rank in Center
            <div className={`text-5xl md:text-7xl font-black font-serif flex items-center justify-center h-full pb-1 ${suitColor} drop-shadow-sm`}>
                {rank}
            </div>
        ) : (
            // Standard Mode: Suit Icon in Center (unless hidden)
            !hideCentralIcon && (
              <div className={`${centerSuitSize} flex items-center justify-center h-full ${compact ? 'pb-1' : 'pb-4'} ${suitColor} drop-shadow-sm`}>
                  {suit}
              </div>
            )
        )}

        {/* Label Badge - Only show if label exists */}
        {label && (
            <div className={`
                absolute bottom-8 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-sm
                ${isRed ? 'bg-red-600' : 'bg-slate-900'}
            `}>
                {label}
            </div>
        )}
      </button>
    );
  }

  // --- RENDER TILE / SYMBOL VARIANT ---
  return (
    <button
      id={domId}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${containerClasses}
        bg-gradient-to-br ${colorFrom} ${colorTo}
        border-2 ${winner ? 'border-green-400' : (betAmount > 0 ? 'border-yellow-500' : 'border-slate-600')}
        ${stateStyles}
        ${shadowStyles}
      `}
    >
      <BetBadge />
      
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50 pointer-events-none"></div>
      
      {/* Icon */}
      {!hideCentralIcon && (
        <div className="z-10 text-4xl md:text-5xl mb-1 drop-shadow-lg transform transition-transform group-hover:scale-110 filter brightness-110">
            {icon}
        </div>
      )}
      
      {/* Label */}
      <span className="z-10 text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white/90 bg-black/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
        {label}
      </span>
      
      {/* Bet Active Glow */}
      {betAmount > 0 && !winner && (
          <div className="absolute inset-0 border-2 border-yellow-500/50 rounded-xl animate-pulse pointer-events-none"></div>
      )}
    </button>
  );
};