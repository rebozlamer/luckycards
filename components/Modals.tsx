import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Button } from './Button';
import { X, Trophy, History, RefreshCcw, Volume2, VolumeX, Moon, Sun, Monitor } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-casino-800 border border-casino-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-[bounce-small_0.2s_ease-out]">
        <div className="flex items-center justify-between p-4 border-b border-casino-700">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Wallet Modal with Ad Simulation
interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCoins: (amount: number) => void;
}
export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onAddCoins }) => {
  const [adTimer, setAdTimer] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer((prev) => {
            if (prev <= 1) {
                // Done
                onAddCoins(100);
                return 0;
            }
            return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [adTimer, onAddCoins]);

  const watchAd = () => {
    setAdTimer(5);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Wallet">
      <div className="space-y-6">
        <div className="bg-slate-900/50 p-4 rounded-xl text-center border border-slate-700">
          <p className="text-slate-400 text-sm mb-1">Current Balance</p>
          <div className="text-4xl font-bold text-yellow-400 flex items-center justify-center gap-2">
             <span>🪙</span>
             {/* This value is dynamic in the header, showing static placeholder here or could pass prop */}
             <span className="text-sm text-slate-500">(See Header)</span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Free Coins</h3>
          {adTimer > 0 ? (
            <Button disabled className="w-full bg-slate-700" size="lg">
              Watching Ad... {adTimer}s
            </Button>
          ) : (
            <Button onClick={watchAd} variant="gold" className="w-full" size="lg">
              Watch Ad (+100 Coins)
            </Button>
          )}
        </div>

        <div className="opacity-50 pointer-events-none grayscale">
          <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Coin Packs (Demo)</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary">+500 ($1.99)</Button>
            <Button variant="secondary">+1000 ($3.99)</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Profile Modal
interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onReset: () => void;
}
export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onReset }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Profile">
            <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto bg-slate-700 rounded-full flex items-center justify-center mb-3 text-3xl">
                    👤
                </div>
                <h3 className="text-2xl font-bold text-white">{user.username}</h3>
                <p className="text-slate-400 text-sm">Guest Account</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Trophy size={14} /> Wins
                    </div>
                    <div className="text-xl font-bold text-white">{user.stats.totalWins}</div>
                </div>
                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <History size={14} /> Rounds
                    </div>
                    <div className="text-xl font-bold text-white">{user.stats.totalRounds}</div>
                </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-6 flex justify-between items-center">
                 <span className="text-slate-400">Total Won</span>
                 <span className="text-yellow-400 font-bold font-mono">+{user.stats.totalCoinsWon.toLocaleString()}</span>
            </div>

            <Button variant="danger" size="sm" onClick={onReset} className="w-full">
                <RefreshCcw size={16} /> Reset Data
            </Button>
        </Modal>
    );
};

// Settings Modal
interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: User['settings'];
    onUpdateSettings: (newSettings: Partial<User['settings']>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settings">
            <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                    <div className="flex items-center gap-3">
                        {settings.soundEnabled ? <Volume2 className="text-green-400" /> : <VolumeX className="text-red-400" />}
                        <span className="font-medium">Sound Effects</span>
                    </div>
                    <button 
                        onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-green-500' : 'bg-slate-600'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.soundEnabled ? 'translate-x-6' : ''}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                    <div className="flex items-center gap-3">
                        <Monitor className="text-blue-400" />
                        <span className="font-medium">Animations</span>
                    </div>
                    <button 
                        onClick={() => onUpdateSettings({ animationsEnabled: !settings.animationsEnabled })}
                        className={`w-12 h-6 rounded-full transition-colors relative ${settings.animationsEnabled ? 'bg-green-500' : 'bg-slate-600'}`}
                    >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.animationsEnabled ? 'translate-x-6' : ''}`} />
                    </button>
                </div>
                
                <div className="text-center text-xs text-slate-500 mt-8">
                    Version 1.0.0
                </div>
            </div>
        </Modal>
    );
}