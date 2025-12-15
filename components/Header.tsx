import React from 'react';
import { User } from '../types';
import { User as UserIcon, Settings, Coins } from 'lucide-react';

interface HeaderProps {
  user: User;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenWallet: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  onOpenProfile, 
  onOpenSettings,
  onOpenWallet
}) => {
  return (
    <header className="sticky top-0 z-50 bg-casino-900/90 backdrop-blur-md border-b border-casino-700 h-16 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="font-bold text-xs text-white">LC</span>
        </div>
        <span className="font-bold text-lg hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600">
          LuckyCards
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        {/* Wallet Pill - Added ID for animation target */}
        <button 
          id="wallet-pill"
          onClick={onOpenWallet}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-full transition-colors group"
        >
          <div className="bg-yellow-500 rounded-full p-1 text-casino-900 group-hover:rotate-12 transition-transform">
            <Coins size={14} strokeWidth={3} />
          </div>
          <span className="font-mono font-bold text-yellow-400">
            {user.wallet.toLocaleString()}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={onOpenProfile}
            className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded-full"
            aria-label="Profile"
          >
            <UserIcon size={20} />
          </button>
          <button 
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-white/5 rounded-full"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};