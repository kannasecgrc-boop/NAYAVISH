
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Product, User, Order } from '../types';
import { getShoppingAdvice } from '../services/geminiService';

interface AIChatProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  orders: Order[];
}

const AIChat: React.FC<AIChatProps> = ({ products, isOpen, onClose, user, orders }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: "Namaste! I'm your Mana Kitchen Assistant. How can I help you pick the perfect meal today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (manualText?: string) => {
    const userMsg = manualText || input.trim();
    if (!userMsg || isLoading) return;

    if (!manualText) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    // Filter orders for the current user to pass to AI
    const userOrders = user ? orders.filter(o => o.customerEmail === user.email) : [];

    const response = await getShoppingAdvice(userMsg, products, messages, userOrders);
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[550px] glass shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] rounded-[40px] border border-white flex flex-col z-[60] overflow-hidden animate-in fade-in slide-in-from-bottom-10">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/80">
        <div className="flex items-center space-x-4">
          <div className="relative">
             <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center text-white text-lg font-black">M</div>
             <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-sm tracking-tight">Kitchen Assistant</h4>
            <div className="flex items-center gap-1.5">
               <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Live Now</span>
               <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
               <span className="text-[9px] font-bold text-gray-400">Signal: High</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-4 rounded-3xl text-sm font-bold leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-gray-900 text-white rounded-tr-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white px-5 py-3 rounded-3xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest animate-pulse">Kitchen is typing...</span>
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-brand rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-brand rounded-full animate-bounce delay-75"></div>
                <div className="w-1 h-1 bg-brand rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Actions for Logged In Users */}
      {user && (
        <div className="px-6 pb-2 bg-white/80 flex gap-2 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => handleSend("Based on my previous orders, what do you recommend I eat today?")}
            className="whitespace-nowrap px-4 py-2 bg-brand/5 text-brand rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-brand/10 transition-colors border border-brand/10 flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Suggestion from my previous order
          </button>
        </div>
      )}

      {/* Input */}
      <div className="p-6 bg-white/80 border-t border-gray-100">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Ask about spices, dishes..."
            className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-4 ring-brand/10 pr-14"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={() => handleSend()}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-gray-900 text-white rounded-xl hover:bg-brand transition-all disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
