
import React from 'react';
import { User, Order, OrderStatus } from '../types';

interface ProfileViewProps {
  user: User;
  orders: Order[];
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, orders, onLogout }) => {
  const userOrders = orders.filter(o => o.customerEmail === user.email || o.customerName === user.name);

  const steps: OrderStatus[] = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];

  const getStepProgress = (currentStatus: OrderStatus) => {
    const idx = steps.indexOf(currentStatus);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div className="max-w-5xl mx-auto py-16 px-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* Left: User Card */}
        <div className="w-full md:w-80 bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm">
          <div className="text-center">
            <div className="relative inline-block">
               <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-[32px] mx-auto mb-6 object-cover border-4 border-gray-50 shadow-inner" />
               <span className="absolute bottom-4 right-0 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none mb-2">{user.name}</h2>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Nayavish Member</p>
          </div>
          
          <div className="mt-10 space-y-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Mobile</p>
              <p className="font-bold text-gray-900">+91 {user.phone}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Registered Address</p>
              <p className="text-xs font-bold text-gray-900 leading-relaxed truncate">{user.address || 'Address Not Set'}</p>
            </div>
          </div>

          <button onClick={onLogout} className="w-full mt-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand transition-all shadow-xl active:scale-95">Logout Session</button>
        </div>

        {/* Right: Order History & Workflow */}
        <div className="flex-1 space-y-8">
          <div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">My Orders</h3>
            <p className="text-gray-500 font-medium">Track your beauty haul from our store to your door.</p>
          </div>

          {userOrders.length === 0 ? (
            <div className="bg-gray-50 rounded-[40px] p-24 text-center border-2 border-dashed border-gray-100 flex flex-col items-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                 <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              </div>
              <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Your history is currently empty</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {userOrders.map(order => {
                const currentStepIdx = getStepProgress(order.status);
                
                return (
                  <div key={order.id} className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm hover:shadow-lg transition-all overflow-hidden border-l-8 border-l-brand">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 border-b border-gray-50 pb-8">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gray-900 text-white rounded-2xl flex flex-col items-center justify-center font-black shadow-lg">
                          <span className="text-[10px] uppercase opacity-50">Items</span>
                          <span className="text-xl">{order.items.length}</span>
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-xl uppercase tracking-tighter">{order.id}</p>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Placed on {new Date(order.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-3xl font-black text-gray-900 tracking-tighter">₹{order.total}</p>
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mt-2 ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-brand/10 text-brand'
                        }`}>
                          <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
                          {order.status}
                        </div>
                      </div>
                    </div>

                    {/* Order Workflow Visualizer */}
                    <div className="relative pt-6 pb-4 px-4">
                       {/* Background Track */}
                       <div className="absolute top-1/2 left-4 right-4 h-1.5 bg-gray-100 -translate-y-1/2 rounded-full"></div>
                       {/* Active Progress */}
                       <div 
                         className="absolute top-1/2 left-4 h-1.5 bg-brand -translate-y-1/2 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(190,24,93,0.3)]"
                         style={{ width: `calc(${(currentStepIdx / (steps.length - 1)) * 100}% - 32px)` }}
                       ></div>
                       
                       <div className="relative flex justify-between">
                         {steps.map((step, idx) => (
                           <div key={step} className="flex flex-col items-center relative">
                              <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 relative z-10 ${
                                idx <= currentStepIdx ? 'bg-brand border-white shadow-xl text-white' : 'bg-white border-gray-100 text-gray-200'
                              }`}>
                                {idx < currentStepIdx ? (
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/></svg>
                                ) : (
                                  <span className="text-[10px] font-black">{idx + 1}</span>
                                )}
                              </div>
                              <span className={`absolute -bottom-10 whitespace-nowrap text-[8px] font-black uppercase tracking-[0.1em] transition-colors ${
                                idx <= currentStepIdx ? 'text-gray-900' : 'text-gray-300'
                              }`}>
                                {step === 'Preparing' ? 'Packing' : step}
                              </span>
                           </div>
                         ))}
                       </div>
                    </div>

                    <div className="mt-20 p-6 bg-gray-50 rounded-3xl flex items-center gap-5 border border-gray-100">
                       <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-none">Order Update</p>
                          <p className="text-xs font-bold text-gray-700 leading-relaxed">
                            {order.status === 'Pending' && 'Your order is being processed. We will accept it shortly.'}
                            {order.status === 'Accepted' && 'Order confirmed! We are gathering your beauty favorites.'}
                            {order.status === 'Preparing' && 'Your items are being packed with care and love.'}
                            {order.status === 'Out for Delivery' && 'Handed over to our courier partner. It\'s on the way!'}
                            {order.status === 'Delivered' && 'Delivered! We hope you love your new look.'}
                            {order.status === 'Cancelled' && 'This order was cancelled. Please contact support if this is a mistake.'}
                          </p>
                       </div>
                    </div>

                    <div className="mt-6 flex justify-between items-center px-2">
                       <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Payment: {order.paymentMethod}</p>
                       <button className="text-[9px] font-black text-brand uppercase tracking-widest underline decoration-2 underline-offset-4">Need Help?</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
