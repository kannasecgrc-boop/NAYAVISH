
import React, { useState } from 'react';
import { OrderDetails, CartItem } from '../types';
import { sendSMS, sendWhatsApp } from '../services/communicationService';

interface CheckoutWorkflowProps {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  onComplete: (details: OrderDetails) => void;
  onCancel: () => void;
}

const CheckoutWorkflow: React.FC<CheckoutWorkflowProps> = ({ items, subtotal, deliveryFee, freeDeliveryThreshold, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [details, setDetails] = useState<OrderDetails>({
    fullName: '',
    email: '',
    address: '',
    city: 'Madhira',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    paymentMethod: 'UPI'
  });

  // Dynamic Shipping Logic
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;
  const finalShippingFee = isFreeDelivery ? 0 : deliveryFee;
  const totalPayable = subtotal + finalShippingFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleFinalOrder = async () => {
    setIsFinalizing(true);
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    
    // Simulating Gateway
    await sendSMS(details.zip || 'Customer', `Order ${orderId} received at Mana Kitchen. Total: ₹${totalPayable}.`);
    await sendWhatsApp('Customer', `Order ${orderId} confirmed! Kitchen is prepping.`);
    
    setTimeout(() => {
        setIsFinalizing(false);
        onComplete(details);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {isFinalizing && (
        <div className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center">
           <div className="w-20 h-20 border-4 border-gray-100 border-t-brand rounded-full animate-spin mb-8" />
           <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Kitchen Transmitting...</h3>
           <p className="text-gray-400 mt-4 font-black uppercase tracking-widest text-[10px]">Verified by Merchant Node</p>
        </div>
      )}

      <div className="mb-12 flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Checkout Progress</h2>
           <div className="flex items-center space-x-4 mt-6">
             {[1, 2, 3].map((s) => (
               <div key={s} className="flex items-center">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${
                   step >= s ? 'bg-brand text-white shadow-lg' : 'bg-gray-100 text-gray-400'
                 }`}>
                   {s}
                 </div>
                 {/* Visual connector line */}
                 {s < 3 && <div className={`w-8 h-1 mx-1 ${step > s ? 'bg-brand' : 'bg-gray-100'}`} />}
                 {s === 1 && step === 1 && <span className="ml-3 text-[10px] font-black uppercase text-brand">Details</span>}
                 {s === 2 && step === 2 && <span className="ml-3 text-[10px] font-black uppercase text-brand">Payment</span>}
                 {s === 3 && step === 3 && <span className="ml-3 text-[10px] font-black uppercase text-brand">Address & Confirm</span>}
               </div>
             ))}
           </div>
        </div>
        <button onClick={onCancel} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-brand">Go Back to Menu</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">1. Your Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <input name="fullName" value={details.fullName} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 ring-brand/5 outline-none font-bold" placeholder="Full Name" />
                <input name="email" value={details.email} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 ring-brand/5 outline-none font-bold" placeholder="Email Address" />
                <input name="zip" value={details.zip} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 ring-brand/5 outline-none font-bold" placeholder="Phone Number" />
              </div>
              <button disabled={!details.fullName || !details.zip} onClick={() => setStep(2)} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl disabled:opacity-30 hover:bg-brand transition-colors">Continue to Payment</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">2. Payment Gateway</h3>
              <div className="grid grid-cols-1 gap-4">
                {['UPI', 'COD'].map((method) => (
                  <button 
                    key={method}
                    onClick={() => { setDetails({...details, paymentMethod: method as any}); }}
                    className={`flex items-center justify-between p-6 rounded-[32px] border-2 transition-all ${details.paymentMethod === method ? 'border-brand bg-brand/5' : 'border-gray-100 bg-white'}`}
                  >
                    <span className="font-black text-gray-900 uppercase tracking-tight">{method === 'UPI' ? 'PhonePe Merchant (UPI)' : 'Cash on Delivery'}</span>
                    <div className={`w-6 h-6 rounded-full border-4 ${details.paymentMethod === method ? 'border-brand bg-white' : 'border-gray-100'}`} />
                  </button>
                ))}
              </div>

              {details.paymentMethod === 'UPI' && (
                <div className="p-8 bg-white border-2 border-gray-100 rounded-[50px] text-center shadow-lg animate-in zoom-in-95">
                   <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="bg-[#6739b7] text-white px-6 py-2 rounded-xl shadow-lg font-black uppercase text-[10px] tracking-widest">PhonePe Merchant</div>
                      <p className="text-gray-500 font-bold text-sm max-w-xs">Proceed to pay securely via any UPI app. You will receive a payment link or request on your number.</p>
                   </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                 <button onClick={() => setStep(1)} className="flex-1 py-5 border-2 border-gray-100 rounded-[24px] font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">Go Back</button>
                 <button onClick={() => setStep(3)} className="flex-[2] py-5 bg-gray-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-brand transition-colors">Enter Address & Confirm</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">3. Delivery & Confirmation</h3>
              <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 space-y-4">
                 <input name="address" value={details.address} onChange={handleChange} className="w-full px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 ring-brand/5 outline-none font-bold" placeholder="Complete Street Address" />
                 <input name="city" value={details.city} disabled className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-2xl font-bold text-gray-500" />
              </div>

              <div className="bg-white border-2 border-gray-100 p-8 rounded-[40px] space-y-8 shadow-sm relative">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                      <p className="font-black text-gray-900 text-lg">{details.fullName}</p>
                      <p className="text-xs text-gray-500 font-medium">{details.email}</p>
                   </div>
                   <button onClick={() => setStep(1)} className="text-[10px] font-black text-brand uppercase underline">Edit Details</button>
                </div>
                <div className="flex justify-between items-center py-6 border-y border-gray-50">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Payment Verified</p>
                    <p className="font-black text-gray-900 uppercase tracking-tight text-lg">{details.paymentMethod === 'UPI' ? 'PhonePe' : 'COD'}</p>
                  </div>
                  <button onClick={() => setStep(2)} className="text-[10px] font-black text-brand uppercase underline">Change</button>
                </div>
              </div>
              <button disabled={!details.address} onClick={handleFinalOrder} className="w-full py-6 bg-brand text-white rounded-[32px] font-black text-lg uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">Place Final Order — ₹{totalPayable}</button>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="bg-white border border-gray-100 p-8 rounded-[40px] h-fit sticky top-24 shadow-sm">
          <h4 className="font-black text-gray-900 uppercase text-xs tracking-widest mb-6 border-b border-gray-50 pb-4">Bill Summary</h4>
          <div className="space-y-4 mb-8">
            {items.map(item => (
              <div key={item.id} className="flex justify-between text-xs">
                <span className="font-bold text-gray-600 truncate flex-1 pr-4">{item.quantity}x {item.name}</span>
                <span className="font-black text-gray-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-100 space-y-3">
             <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase"><span>Subtotal</span><span>₹{subtotal}</span></div>
             <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
               <span>Handling & Prep</span>
               {isFreeDelivery ? (
                 <span className="text-green-600"><span className="line-through text-gray-300 mr-2">₹{deliveryFee}</span>FREE</span>
               ) : (
                 <span>₹{deliveryFee}</span>
               )}
             </div>
             {isFreeDelivery && (
               <div className="text-[9px] text-green-600 bg-green-50 px-2 py-1 rounded text-center font-bold">Free Delivery applied on orders above ₹{freeDeliveryThreshold}</div>
             )}
             <div className="flex justify-between text-2xl font-black text-gray-900 pt-2 tracking-tighter"><span>To Pay</span><span className="text-brand">₹{totalPayable}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutWorkflow;
    