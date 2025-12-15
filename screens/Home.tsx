import React from 'react';
import { GameMode } from '../types';

interface HomeProps {
  onSelectMode: (mode: GameMode) => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectMode }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 animate-[fadeIn_0.5s_ease-out]">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-sm mb-2 uppercase tracking-tight">
          Lucky Lobby
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-medium uppercase tracking-widest">Select Table</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
        <button
          onClick={() => onSelectMode('2X')}
          className="group relative overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl border border-yellow-500/30 p-8 text-center transition-all hover:scale-[1.02] hover:border-yellow-500 hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]"
        >
          <div className="relative z-10 flex flex-col items-center justify-center h-32">
            <span className="block text-6xl font-black italic text-white drop-shadow-lg mb-2">
              2X
            </span>
            <div className="h-1 w-12 bg-yellow-500 rounded-full"></div>
          </div>
        </button>

        <button
          onClick={() => onSelectMode('10X')}
          className="group relative overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl border border-purple-500/30 p-8 text-center transition-all hover:scale-[1.02] hover:border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
        >
          <div className="relative z-10 flex flex-col items-center justify-center h-32">
            <span className="block text-6xl font-black italic text-white drop-shadow-lg mb-2">
              10X
            </span>
            <div className="h-1 w-12 bg-purple-500 rounded-full"></div>
          </div>
        </button>
      </div>
    </div>
  );
};