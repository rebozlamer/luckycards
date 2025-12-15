import React, { useEffect, useState } from 'react';
import { User, GameMode } from './types';
import { loadUser, saveUser, resetUser } from './services/storage';
import { Header } from './components/Header';
import { Home } from './screens/Home';
import { GameTable } from './screens/GameTable';
import { WalletModal, ProfileModal, SettingsModal } from './components/Modals';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentMode, setCurrentMode] = useState<GameMode>('HOME');
  
  // Modals state
  const [isWalletOpen, setWalletOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  // Initialize User
  useEffect(() => {
    const loaded = loadUser();
    setUser(loaded);
  }, []);

  // Save User on change
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    saveUser(updatedUser);
  };

  const handleReset = () => {
    const newUser = resetUser();
    setUser(newUser);
    setProfileOpen(false);
    setCurrentMode('HOME');
  };

  const handleAddCoins = (amount: number) => {
    if (user) {
        handleUpdateUser({
            ...user,
            wallet: user.wallet + amount
        });
    }
  };

  const updateSettings = (newSettings: Partial<User['settings']>) => {
      if (user) {
          handleUpdateUser({
              ...user,
              settings: { ...user.settings, ...newSettings }
          });
      }
  };

  if (!user) return <div className="h-screen flex items-center justify-center text-slate-500">Loading Casino...</div>;

  return (
    <div className="min-h-screen bg-casino-900 text-slate-200 flex flex-col font-sans">
      <Header 
        user={user}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenWallet={() => setWalletOpen(true)}
      />

      <main className="flex-1 relative overflow-hidden">
        {currentMode === 'HOME' && (
          <Home onSelectMode={setCurrentMode} />
        )}
        
        {currentMode === '2X' && (
          <GameTable 
            mode="2X" 
            user={user} 
            onUpdateUser={handleUpdateUser}
            onBack={() => setCurrentMode('HOME')}
            onOpenWallet={() => setWalletOpen(true)}
          />
        )}

        {currentMode === '10X' && (
          <GameTable 
            mode="10X" 
            user={user} 
            onUpdateUser={handleUpdateUser}
            onBack={() => setCurrentMode('HOME')}
            onOpenWallet={() => setWalletOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <WalletModal 
        isOpen={isWalletOpen} 
        onClose={() => setWalletOpen(false)}
        onAddCoins={handleAddCoins}
      />
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setProfileOpen(false)} 
        user={user}
        onReset={handleReset}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={user.settings}
        onUpdateSettings={updateSettings}
      />
    </div>
  );
};

export default App;