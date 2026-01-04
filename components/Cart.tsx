
import React from 'react';
import { CartItem } from '../types';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (id: string) => void;
  onUpdateQty: (id: string, delta: number) => void;
  onCheckout: () => void;
  freeDeliveryThreshold: number;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onRemove, onUpdateQty, onCheckout, freeDeliveryThreshold }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const mrpTotal = items.reduce((sum, item) => sum + (item.mrp || item.price) * item.quantity, 0);
  const totalSavings = mrpTotal - subtotal;
  
  const threshold = freeDeliveryThreshold || 0;
  const neededForFreeShip = Math.max(0, threshold - subtotal);
  const progress = threshold > 0 ? Math.min(100, (subtotal / threshold) * 100) : 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col rounded-l-[50px] overflow-hidden animate-in slide-in-from-right-full duration-500">
          <div className="flex items-center justify-between p-8 border-b border-gray-50 bg-white/80 sticky top-0 z-10">
            <div>
               <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Your Bag</h2>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{items.length} items selected</p>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          
          {/* Free Delivery Nudge */}
          {items.length > 0 && threshold > 0 && (
            <div className="bg-brand/5 px-8 py-4 border-b border-brand/10">
              {neededForFreeShip > 0 ? (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div className="flex-1">
                     <p className="text-xs font-bold text-gray-900">Add <span className="text-brand">₹{neededForFreeShip}</span> more for Free Shipping!</p>
                     <div className="h-1.5 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-brand rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                   </div>
                   <p className="text-xs font-black text-green-600 uppercase tracking-wide">Free Shipping Unlocked!</p>
                </div>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 11-1 9"/><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8a2 2 0 0 0 2-1.6l1.7-7.4"/><path d="m9 11 1 9"/><path d="M4.5 15.5h15"/><path d="m5 11 4-7"/></svg>
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Your bag is empty</h3>
                  <p className="text-gray-400 font-medium mt-2">The best skincare and beauty products are just a click away.</p>
                </div>
                <button 
                  onClick={onClose}
                  className="px-8 py-4 bg-brand text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex space-x-6 animate-in slide-in-from-bottom-2">
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-3xl overflow-hidden border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-black text-gray-900 truncate pr-4 uppercase tracking-tight leading-none">{item.name}</h4>
                        <button onClick={() => onRemove(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-gray-400 line-through font-bold">₹{item.mrp || item.price}</span>
                        <span className="text-xs font-black text-brand tracking-tighter">₹{item.price}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center bg-gray-50 rounded-xl p-1">
                        <button 
                          onClick={() => onUpdateQty(item.id, -1)}
                          className="p-1.5 text-gray-400 hover:text-brand transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                        </button>
                        <span className="px-3 text-[10px] font-black text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQty(item.id, 1)}
                          className="p-1.5 text-gray-400 hover:text-brand transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                        </button>
                      </div>
                      <span className="text-sm font-black text-gray-900 tracking-tighter">₹{item.price * item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-8 bg-gray-50 rounded-t-[40px] shadow-2xl border-t border-gray-100 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <span>M.R.P. Total</span>
                  <span className="line-through">₹{mrpTotal}</span>
                </div>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-green-600">
                  <span>Beauty Deal</span>
                  <span>-₹{totalSavings}</span>
                </div>
                <div className="flex justify-between text-sm pt-4 border-t border-gray-200">
                  <span className="text-gray-900 font-black uppercase tracking-tighter text-xl">Total Pay</span>
                  <span className="text-3xl font-black text-brand tracking-tighter">₹{subtotal}</span>
                </div>
              </div>
              
              <button 
                onClick={onCheckout}
                className="w-full py-6 bg-brand text-white rounded-[24px] font-black text-[12px] uppercase tracking-[0.2em] hover:scale-[1.02] transition-all shadow-2xl active:scale-95 border-b-8 border-brand/20"
              >
                Checkout Now
              </button>
              <div className="flex items-center justify-center gap-2 text-[9px] text-gray-400 font-black uppercase tracking-widest">
                <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                Secure Regional Transaction
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
