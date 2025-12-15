import React, { useState, useEffect } from 'react';
import { User, GameState } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { playSound } from '../services/audio';
import { ChevronLeft, Trash2, Repeat, ChevronsUp, AlertCircle } from 'lucide-react';

interface GameTableProps {
  mode: '2X' | '10X';
  user: User;
  onUpdateUser: (user: User) => void;
  onBack: () => void;
  onOpenWallet: () => void;
}

const ROUND_DURATION = 10;
const RESULT_DURATION = 3;

// Animation Types
interface FlyingChip {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay?: number;
}

// 2X Items
const ITEMS_2X = [
  { 
      id: 'red', 
      label: '', 
      variant: 'poker',
      suit: '♥', 
      rank: 'K',
      color: 'red' 
  },
  { 
      id: 'black', 
      label: '', 
      variant: 'poker',
      suit: '♠', 
      rank: 'Q',
      color: 'black' 
  },
];

// 10X Items
const ITEMS_10X = [
  { id: '1',  label: '',   variant: 'poker', suit: '♠', rank: 'A' },
  { id: '2',  label: '',   variant: 'poker', suit: '♥', rank: '2' },
  { id: '3',  label: '',   variant: 'poker', suit: '♣', rank: '3' },
  { id: '4',  label: '',   variant: 'poker', suit: '♦', rank: '4' },
  { id: '5',  label: '',   variant: 'poker', suit: '♠', rank: '5' },
  { id: '6',  label: '',   variant: 'poker', suit: '♥', rank: '6' },
  { id: '7',  label: '',   variant: 'poker', suit: '♣', rank: '7' },
  { id: '8',  label: '',   variant: 'poker', suit: '♦', rank: '8' },
  { id: '9',  label: '',   variant: 'poker', suit: '♠', rank: '9' },
  { id: '10', label: '',   variant: 'poker', suit: '♥', rank: '10' },
];

const CHIP_VALUES = [10, 20, 50, 100];

// Internal Component for Rendering a single flying chip
const FlyingChipRenderer: React.FC<FlyingChip & { onComplete: (id: string) => void }> = ({ id, startX, startY, endX, endY, delay = 0, onComplete }) => {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: startX,
    top: startY,
    transform: 'translate(0, 0) scale(1)',
    opacity: 1,
    zIndex: 100,
    transition: `all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${delay}ms`
  });

  useEffect(() => {
    // Trigger animation next frame
    requestAnimationFrame(() => {
      setStyle(prev => ({
        ...prev,
        left: endX,
        top: endY,
        transform: 'translate(0, 0) scale(0.5)',
        opacity: 0,
      }));
    });

    // Cleanup
    const timer = setTimeout(() => {
      onComplete(id);
    }, 600 + delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={style} className="pointer-events-none">
      <div className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-yellow-200 shadow-lg flex items-center justify-center">
        <div className="w-3 h-3 rounded-full border border-yellow-600/50 bg-yellow-300"></div>
      </div>
    </div>
  );
};

export const GameTable: React.FC<GameTableProps> = ({ mode, user, onUpdateUser, onBack, onOpenWallet }) => {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'BETTING',
    timeLeft: ROUND_DURATION,
    roundId: 1,
    winningCard: null,
    history: [],
  });

  const [bets, setBets] = useState<Record<string, number>>({});
  const [prevBets, setPrevBets] = useState<Record<string, number>>({});
  const [selectedChip, setSelectedChip] = useState<number>(10);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Animation State
  const [flyingChips, setFlyingChips] = useState<FlyingChip[]>([]);
  
  // Cast items to any to handle mixed types in mapping
  const items = mode === '2X' ? ITEMS_2X : ITEMS_10X;
  const totalBet = Object.values(bets).reduce((sum, val) => sum + val, 0);

  // Timer Logic
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (gameState.phase === 'BETTING') {
      if (gameState.timeLeft > 0) {
        timer = setTimeout(() => {
          setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
          if (gameState.timeLeft <= 3) {
             playSound('tick', user.settings.soundEnabled);
          }
        }, 1000);
      } else {
        handleRoundEnd();
      }
    } else if (gameState.phase === 'RESULT') {
       timer = setTimeout(() => {
         startNewRound();
       }, RESULT_DURATION * 1000);
    }

    return () => clearTimeout(timer);
  }, [gameState.phase, gameState.timeLeft]);

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 2000);
  };

  const spawnChip = (start: {x: number, y: number}, end: {x: number, y: number}, delay: number = 0) => {
    const id = Math.random().toString(36).substr(2, 9);
    setFlyingChips(prev => [...prev, {
      id,
      startX: start.x,
      startY: start.y,
      endX: end.x,
      endY: end.y,
      delay
    }]);
  };

  const handleRoundEnd = () => {
    const winnerItem = items[Math.floor(Math.random() * items.length)];
    const winnerId = winnerItem.id;
    
    const winAmountOnCard = bets[winnerId] || 0;
    const multiplier = mode === '2X' ? 2 : 10;
    const payout = winAmountOnCard * multiplier;
    
    if (totalBet > 0) {
        setPrevBets(bets);
    }

    const newUser = { ...user };
    
    // Win Animation Logic
    if (payout > 0) {
        newUser.wallet += payout;
        newUser.stats.totalWins += 1;
        newUser.stats.totalCoinsWon += Math.max(0, payout - totalBet);
        playSound('win', user.settings.soundEnabled);

        // Spawn win particles
        const cardEl = document.getElementById(`card-${winnerId}`);
        const walletEl = document.getElementById('wallet-pill');
        
        if (cardEl && walletEl) {
            const cardRect = cardEl.getBoundingClientRect();
            const walletRect = walletEl.getBoundingClientRect();
            
            // Spawn 8 chips bursting from card to wallet
            for (let i = 0; i < 8; i++) {
                spawnChip(
                    { 
                      x: cardRect.left + cardRect.width/2 + (Math.random() * 40 - 20), 
                      y: cardRect.top + cardRect.height/2 + (Math.random() * 40 - 20)
                    },
                    { 
                      x: walletRect.left + walletRect.width/2, 
                      y: walletRect.top + walletRect.height/2 
                    },
                    i * 50 // Staggered delay
                );
            }
        }

    } else {
        if (totalBet > 0) playSound('lose', user.settings.soundEnabled);
    }

    newUser.stats.totalRounds += 1;
    newUser.stats.preferredMode = mode;
    
    onUpdateUser(newUser);

    setGameState(prev => ({
      ...prev,
      phase: 'RESULT',
      winningCard: winnerId
    }));
  };

  const startNewRound = () => {
    setBets({});
    setGameState(prev => ({
      ...prev,
      phase: 'BETTING',
      timeLeft: ROUND_DURATION,
      winningCard: null,
      roundId: prev.roundId + 1
    }));
  };

  const handleItemClick = (itemId: string, e: React.MouseEvent) => {
    if (gameState.phase !== 'BETTING') return;
    
    if (user.wallet < selectedChip) {
        showToast("Insufficient Funds!");
        playSound('lose', user.settings.soundEnabled); 
        onOpenWallet();
        return;
    }

    // Spawn bet animation (Mouse -> Card Center)
    const cardEl = document.getElementById(`card-${itemId}`);
    if (cardEl) {
        const rect = cardEl.getBoundingClientRect();
        spawnChip(
            { x: e.clientX - 12, y: e.clientY - 12 }, // Offset center of chip
            { x: rect.left + rect.width / 2 - 12, y: rect.top + rect.height / 2 - 12 }
        );
    }

    onUpdateUser({ ...user, wallet: user.wallet - selectedChip });

    setBets(prev => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + selectedChip
    }));
    
    playSound('click', user.settings.soundEnabled);
  };

  const clearBets = () => {
      if (gameState.phase !== 'BETTING' || totalBet === 0) return;
      onUpdateUser({ ...user, wallet: user.wallet + totalBet });
      setBets({});
      playSound('click', user.settings.soundEnabled);
  };

  const rebet = () => {
      if (gameState.phase !== 'BETTING' || totalBet > 0) return;
      const totalPrev = Object.values(prevBets).reduce((a,b) => a+b, 0);
      
      if (totalPrev === 0) return;
      
      if (user.wallet < totalPrev) {
          showToast("Not enough coins to rebet!");
          onOpenWallet();
          return;
      }

      onUpdateUser({ ...user, wallet: user.wallet - totalPrev });
      setBets(prevBets);
      playSound('click', user.settings.soundEnabled);
  };

  const doubleBets = () => {
      if (gameState.phase !== 'BETTING' || totalBet === 0) return;
      
      const amountNeeded = totalBet; 

      if (user.wallet < amountNeeded) {
          showToast("Not enough coins to double!");
          onOpenWallet();
          return;
      }

      onUpdateUser({ ...user, wallet: user.wallet - amountNeeded });
      
      setBets(prev => {
          const newBets = { ...prev };
          for (const key in newBets) {
              if (newBets[key] > 0) {
                  newBets[key] *= 2;
              }
          }
          return newBets;
      });
      playSound('click', user.settings.soundEnabled);
  };

  const getTimerColor = () => {
    if (gameState.phase === 'RESULT') return 'text-slate-500';
    if (gameState.timeLeft <= 3) return 'text-red-500 animate-pulse-fast';
    return 'text-white';
  };

  const TimerComponent = () => (
    <div className="flex items-center justify-center">
        {gameState.phase === 'BETTING' ? (
        <div className={`relative w-20 h-20 rounded-full border-4 border-slate-700 bg-slate-800 flex items-center justify-center ${getTimerColor()}`}>
            <span className="text-3xl font-black font-mono tracking-tighter">
                {gameState.timeLeft}
            </span>
            <span className="absolute -bottom-2 bg-slate-900 text-[8px] px-2 py-0.5 rounded text-slate-400 font-bold uppercase border border-slate-700">
                Sec
            </span>
        </div>
        ) : (
        <div className="animate-pulse flex flex-col items-center justify-center w-20 h-20 bg-slate-800 rounded-full border-4 border-yellow-500">
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Winner</span>
            <span className="text-xl font-black text-white leading-none text-center">
                 {/* @ts-ignore */}
                 {items.find(i => i.id === gameState.winningCard)?.rank}
                 {/* @ts-ignore */}
                 {items.find(i => i.id === gameState.winningCard)?.suit}
            </span>
        </div>
        )}
    </div>
  );

  const FooterControls = () => (
    <div className="absolute bottom-0 left-0 right-0 bg-casino-800/95 backdrop-blur border-t border-casino-700 p-2 pb-6 safe-area-bottom shadow-[0_-5px_30px_rgba(0,0,0,0.6)] z-40">
        <div className="max-w-3xl mx-auto flex gap-2 items-stretch px-2 h-12">
            
            {/* Action Stack */}
            <div className="flex gap-1 mr-2">
                {totalBet === 0 ? (
                    <button 
                        onClick={rebet}
                        disabled={gameState.phase !== 'BETTING' || Object.keys(prevBets).length === 0}
                        className="flex flex-col items-center justify-center text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg px-2 md:px-4 min-w-[50px] transition-all disabled:opacity-30"
                    >
                        <Repeat size={16} />
                        <span className="text-[8px] font-bold uppercase mt-0.5">Rebet</span>
                    </button>
                ) : (
                    <button 
                        onClick={clearBets}
                        disabled={gameState.phase !== 'BETTING'}
                        className="flex flex-col items-center justify-center text-slate-400 hover:text-red-400 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg px-2 md:px-4 min-w-[50px] transition-all disabled:opacity-30"
                    >
                        <Trash2 size={16} />
                        <span className="text-[8px] font-bold uppercase mt-0.5">Clear</span>
                    </button>
                )}

                <button 
                    onClick={doubleBets}
                    disabled={gameState.phase !== 'BETTING' || totalBet === 0}
                    className="flex flex-col items-center justify-center text-slate-300 hover:text-green-400 bg-slate-700/50 hover:bg-slate-700 rounded-lg px-2 md:px-4 min-w-[50px] transition-all disabled:opacity-30"
                >
                    <ChevronsUp size={16} />
                    <span className="text-[8px] font-bold uppercase mt-0.5">2X</span>
                </button>
            </div>

            {/* Chip Selector */}
            <div className="flex-1 bg-slate-900/40 rounded-xl flex justify-between px-2 md:px-4 items-center">
                {CHIP_VALUES.map((val) => (
                    <button
                        key={val}
                        onClick={() => {
                            setSelectedChip(val);
                            playSound('click', user.settings.soundEnabled);
                        }}
                        className={`
                            relative w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center
                            font-black font-mono text-xs shadow-md transition-all
                            ${selectedChip === val 
                                ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black -translate-y-1 scale-110 shadow-yellow-500/20 ring-1 ring-white' 
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600 border border-slate-600'}
                        `}
                    >
                        {val}
                    </button>
                ))}
            </div>

            {/* Total Bet Display */}
            <div className="flex flex-col items-center justify-center bg-black/40 rounded-lg px-3 min-w-[70px] border border-white/5">
                <span className="text-[8px] text-slate-500 uppercase font-bold">Total Bet</span>
                <span className={`text-sm md:text-lg font-mono font-bold ${totalBet > 0 ? 'text-yellow-400' : 'text-slate-400'}`}>
                    {totalBet}
                </span>
            </div>
        </div>
    </div>
  );

  return (
    <div className="flex h-full w-full relative overflow-hidden bg-casino-900 flex-row">
      
      {/* Animation Layer */}
      {flyingChips.map(chip => (
        <FlyingChipRenderer 
          key={chip.id} 
          {...chip} 
          onComplete={(id) => setFlyingChips(prev => prev.filter(c => c.id !== id))} 
        />
      ))}

      {/* Toast Notification */}
      {toastMessage && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] animate-pop-in">
              <div className="bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 border-2 border-red-400">
                  <AlertCircle size={20} />
                  {toastMessage}
              </div>
          </div>
      )}

      {/* --- SIDEBAR (Unified for both modes) --- */}
      <div className="w-24 md:w-32 bg-slate-900/80 border-r border-white/5 flex flex-col items-center py-6 gap-6 z-10">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-400 px-0">
              <ChevronLeft size={18} /> <span className="text-xs">Back</span>
          </Button>
          
          <div className="flex flex-col items-center">
              <span className="text-[9px] text-slate-500 font-bold uppercase mb-1">Round</span>
              <span className="font-mono text-slate-300">#{gameState.roundId}</span>
          </div>

          <div className="flex-1 flex items-center justify-center">
              <TimerComponent />
          </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col relative h-full">
          <div className="flex-1 p-1 md:p-4 flex items-center justify-center overflow-hidden">
              {mode === '2X' ? (
                // --- 2X GRID (Small, Fixed, Centered) ---
                <div className="grid grid-cols-2 gap-8 w-full max-w-[300px] aspect-[2/1.5]">
                   {items.map((item: any) => (
                       <Card 
                           key={item.id} 
                           domId={`card-${item.id}`} // Pass ID for animation
                           {...item}
                           betAmount={bets[item.id] || 0}
                           winner={gameState.phase === 'RESULT' && gameState.winningCard === item.id}
                           loser={gameState.phase === 'RESULT' && gameState.winningCard !== item.id}
                           disabled={gameState.phase === 'RESULT'}
                           onClick={(e) => handleItemClick(item.id, e)} // Pass event
                           className="text-4xl shadow-2xl" 
                       />
                   ))}
                </div>
              ) : (
                // --- 10X GRID (Fixed 5x2, Aspect Ratio Preserved, Smaller to fit footer) ---
                // Reduced max-w to lg (from 3xl) to ensure cards are small and don't push footer off
                <div className="grid grid-cols-5 gap-1 md:gap-2 w-full max-w-lg">
                    {items.map((item: any) => (
                        <Card 
                            key={item.id} 
                            domId={`card-${item.id}`} // Pass ID for animation
                            {...item}
                            compact={true} // Use compact mode for 10X
                            betAmount={bets[item.id] || 0}
                            winner={gameState.phase === 'RESULT' && gameState.winningCard === item.id}
                            loser={gameState.phase === 'RESULT' && gameState.winningCard !== item.id}
                            disabled={gameState.phase === 'RESULT'}
                            onClick={(e) => handleItemClick(item.id, e)} // Pass event
                            className="w-full aspect-[3/4] shadow-xl" // Fixed Aspect Ratio
                        />
                    ))}
                </div>
              )}
          </div>
          {/* Spacer for footer */}
          <div className="h-20" />
          <FooterControls />
      </div>
    </div>
  );
};