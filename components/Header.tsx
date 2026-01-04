
import React, { useState } from 'react';
import { View, User } from '../types';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
  cartCount: number;
  storeName: string;
  user: User | null;
  onOpenCart: () => void;
  onOpenLogin: () => void;
  onSearch: (query: string) => void;
  installPrompt?: any;
  onInstallApp?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentView, setView, cartCount, storeName, user, onOpenCart, onOpenLogin, onSearch, installPrompt, onInstallApp 
}) => {
  const [search, setSearch] = useState('');
  const firstLetter = storeName.charAt(0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-gray-100/50 px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 md:gap-0">
          {/* Mobile Back Button - Only visible if not on Home */}
          {currentView !== View.HOME && (
            <button 
              onClick={() => setView(View.HOME)} 
              className="md:hidden p-2 -ml-2 text-gray-500 hover:text-brand active:scale-90 transition-transform"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}

          {/* Logo */}
          <div className="text-xl md:text-2xl font-black tracking-tighter cursor-pointer flex items-center shrink-0" onClick={() => setView(View.HOME)}>
            <span className="w-8 h-8 md:w-10 md:h-10 bg-brand rounded-xl flex items-center justify-center text-white mr-2 md:mr-3 text-sm md:text-lg">{firstLetter}</span>
            <span className="hidden sm:inline">NAYA<span className="text-brand">VISH</span></span>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden md:block px-8">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input 
              type="text" 
              placeholder="Search products..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-brand/20 focus:ring-4 ring-brand/5 rounded-2xl outline-none text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden lg:flex items-center space-x-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          <button onClick={() => setView(View.HOME)} className={`hover:text-brand transition-colors ${currentView === View.HOME ? 'text-brand' : ''}`}>Home</button>
          <button onClick={() => setView(View.SHOP)} className={`hover:text-brand transition-colors ${currentView === View.SHOP ? 'text-brand' : ''}`}>Catalog</button>
          {installPrompt && (
             <button onClick={onInstallApp} className="bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-brand transition-colors animate-pulse">
               Install App
             </button>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <button onClick={onOpenCart} className="relative p-2 md:p-3 hover:bg-gray-100 rounded-2xl transition-all group">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900 group-hover:text-brand"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-brand text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-lg ring-2 ring-white">{cartCount}</span>}
          </button>
          
          {user ? (
            <div className="flex items-center space-x-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-all" onClick={() => setView(View.PROFILE)}>
              <img src={user.avatar} alt={user.name} className="w-8 h-8 md:w-9 md:h-9 rounded-xl object-cover shadow-sm" />
              <div className="hidden lg:block pr-3">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Hello, {user.name.split(' ')[0]}</p>
                <p className="text-xs font-black text-brand leading-none">My Orders</p>
              </div>
            </div>
          ) : (
            <button onClick={onOpenLogin} className="flex items-center space-x-2 p-2 px-4 md:p-3 md:px-5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand transition-all shadow-lg">Login</button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
