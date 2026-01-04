
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { sendSMS, initiateVoiceCall, addSystemLog } from '../services/communicationService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User, isAdmin: boolean) => void;
  registeredUsers: User[];
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, registeredUsers }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'details' | 'otp' | 'recovery' | 'reset-success'>('details');
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState<{email?: string, phone?: string}>({});
  const [timer, setTimer] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recoveryReason, setRecoveryReason] = useState<'login' | 'recovery'>('login');

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  const validatePhone = (phone: string) => {
    return /^\d{10}$/.test(phone);
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {email?: string, phone?: string} = {};
    
    // Validation based on mode
    if ((loginMethod === 'password' || isSignUp || isAdminMode)) {
      if (!validateEmail(email)) newErrors.email = 'Valid email required';
    }
    
    // Phone validation only if NOT admin and (Using OTP or Signing Up)
    if (!isAdminMode && (loginMethod === 'otp' || isSignUp)) {
      if (!validatePhone(phone)) newErrors.phone = 'Valid 10-digit mobile number required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    // Admin Login Simulation
    if (isAdminMode) {
       if (email === 'admin@mana.com' && password === 'admin') {
         onLogin({} as User, true); // True flag for Admin
         onClose();
       } else {
         alert('Invalid Admin Credentials (Try admin@mana.com / admin)');
       }
       return;
    }

    // Password Login Flow (User exists check)
    if (loginMethod === 'password' && !isSignUp) {
      const foundUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser) {
        // Validate Password
        if (foundUser.password && foundUser.password !== password) {
          alert('Incorrect Password entered. Please try again.');
          return;
        }
        completeLogin(foundUser);
      } else {
        alert('Account not found with this email. Please Sign Up or check spelling.');
      }
    } 
    // Sign Up Flow
    else if (isSignUp) {
       // Check if already exists
       const exists = registeredUsers.some(u => u.email === email || u.phone === phone);
       if (exists) {
         alert('User already registered! Please Login.');
         setIsSignUp(false);
         return;
       }
       completeLogin();
    }
    // OTP Login Flow
    else {
      setIsProcessing(true);
      // Check if phone exists (Optional for OTP flow, we can auto-create or error. Let's send OTP regardless for security/mock)
      const success = await sendSMS(phone, "Your Mana Family Restaurant verification code is 123456.");
      if (success) {
        addSystemLog('SMS', phone, 'DELIVERED (SIMULATED)');
        setRecoveryReason('login');
        setStep('otp');
        setTimer(30);
      }
      setIsProcessing(false);
    }
  };

  const handleStartRecovery = async () => {
    if (!validatePhone(phone)) {
      setErrors({ phone: 'Enter mobile number for recovery' });
      return;
    }
    setIsProcessing(true);
    await sendSMS(phone, "Verification code for account recovery: 654321");
    addSystemLog('SMS', phone, 'RECOVERY SENT');
    setRecoveryReason('recovery');
    setStep('otp');
    setTimer(30);
    setIsProcessing(false);
  };

  const handleCallRequest = async () => {
    setIsProcessing(true);
    const success = await initiateVoiceCall(phone, "1 2 3 4 5 6");
    if (success) {
      addSystemLog('CALL', phone, 'CONNECTED (SIMULATED)');
      alert(`Automated call started to +91 ${phone}. Listen for the code.`);
    }
    setIsProcessing(false);
  };

  const completeLogin = (existingUser?: User) => {
    if (existingUser) {
      onLogin(existingUser, false);
    } else {
      // Create new user (Sign Up or OTP guest)
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name || (email ? email.split('@')[0] : `Guest-${phone}`),
        email: email || `${phone}@mana.local`,
        phone: phone,
        address: address,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email || phone}`,
        joinedAt: new Date().toISOString(),
        // Save password if provided (Sign Up / Password Login flow)
        password: (isSignUp || loginMethod === 'password') ? password : undefined 
      };
      onLogin(newUser, false);
    }
    
    // Reset State
    setStep('details');
    setOtp(['', '', '', '', '', '']);
    onClose();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length < 6) return;
    if (recoveryReason === 'recovery') {
       setStep('reset-success');
    } else {
       // Find user by phone for OTP login
       const foundUser = registeredUsers.find(u => u.phone === phone);
       completeLogin(foundUser);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-[40px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {step === 'details' ? (
          <div className="p-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                {isAdminMode ? 'Admin Portal' : isSignUp ? 'Create Account' : 'Welcome'}
              </h2>
              
              {!isSignUp && !isAdminMode && (
                <div className="mt-6 flex p-1 bg-gray-100 rounded-2xl">
                  <button onClick={() => setLoginMethod('password')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${loginMethod === 'password' ? 'bg-white text-brand shadow-sm' : 'text-gray-400'}`}>
                    Password
                  </button>
                  <button onClick={() => setLoginMethod('otp')} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${loginMethod === 'otp' ? 'bg-white text-brand shadow-sm' : 'text-gray-400'}`}>
                    Mobile OTP
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleAction} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 ring-brand outline-none font-bold" placeholder="Your Name" />
                </div>
              )}
              
              {/* Email Input: Shown for Password Login, SignUp, Admin */}
              {(loginMethod === 'password' || isSignUp || isAdminMode) && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email / Login ID</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={`w-full px-5 py-4 bg-gray-50 border ${errors.email ? 'border-red-300' : 'border-gray-100'} rounded-2xl focus:ring-4 ring-brand outline-none font-bold`} placeholder="email@example.com" />
                </div>
              )}

              {/* Phone Input: Shown for OTP Login, SignUp. HIDDEN for Password Login */}
              {(!isAdminMode && (loginMethod === 'otp' || isSignUp)) && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r border-gray-200 pr-3">+91</span>
                    <input type="tel" required value={phone} maxLength={10} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} className={`w-full pl-16 pr-5 py-4 bg-gray-50 border ${errors.phone ? 'border-red-300' : 'border-gray-100'} rounded-2xl focus:ring-4 ring-brand outline-none font-mono font-bold`} placeholder="1234567890" />
                  </div>
                </div>
              )}

              {isSignUp && (
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Address</label>
                  <textarea required value={address} onChange={e => setAddress(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 ring-brand outline-none font-bold h-20 resize-none" placeholder="Delivery details..." />
                </div>
              )}

              {/* Password Input: Shown for Password Login, SignUp, Admin. HIDDEN for OTP Login */}
              {(loginMethod === 'password' || isSignUp || isAdminMode) && (
                <div>
                  <div className="flex justify-between items-center mb-1.5 ml-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Password</label>
                    {!isSignUp && !isAdminMode && <button type="button" onClick={handleStartRecovery} className="text-[10px] text-brand font-black uppercase hover:underline">Forgot?</button>}
                  </div>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 ring-brand outline-none" placeholder="••••••••" />
                </div>
              )}

              <button type="submit" disabled={isProcessing} className="w-full py-5 bg-brand text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand transition-all shadow-xl flex items-center justify-center gap-3">
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  isAdminMode ? 'Access Admin Portal' : isSignUp ? 'Sign Up Now' : loginMethod === 'password' ? 'Secure Login' : 'Get OTP'
                )}
              </button>
            </form>

            <div className="mt-8 flex justify-between items-center text-xs">
              <div>
                <span className="text-gray-400">{isSignUp ? 'Have account?' : "New user?"}</span>
                <button onClick={() => { setIsSignUp(!isSignUp); setStep('details'); setIsAdminMode(false); }} className="ml-2 text-brand font-bold">{isSignUp ? 'Login' : 'Sign Up'}</button>
              </div>
              <button 
                onClick={() => { setIsAdminMode(!isAdminMode); setIsSignUp(false); }} 
                className={`font-black uppercase tracking-widest ${isAdminMode ? 'text-gray-900' : 'text-gray-300 hover:text-gray-900'}`}
              >
                {isAdminMode ? 'User Login' : 'Admin Login'}
              </button>
            </div>
          </div>
        ) : step === 'otp' ? (
          <div className="p-10 animate-in fade-in slide-in-from-right-4">
            <button onClick={() => setStep('details')} className="mb-6 flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-brand">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg> Back
            </button>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Verify Code</h2>
              <p className="text-gray-500 mt-2 text-sm">Code sent to <span className="font-bold text-gray-900">+91 {phone}</span></p>
              
              <div className="mt-4 p-4 bg-indigo-50 border-2 border-dashed border-indigo-100 rounded-3xl">
                <p className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.2em] mb-1">Developer Mode</p>
                <p className="text-[9px] text-indigo-500 font-bold">Real-time SMS/Call simulation is active. Check Admin Logs.</p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-8">
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input key={idx} id={`otp-${idx}`} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleOtpChange(idx, e.target.value)} className="w-12 h-16 text-center text-2xl font-black bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-brand focus:outline-none transition-all" />
                ))}
              </div>

              <div className="space-y-4">
                <button type="submit" disabled={otp.join('').length < 6} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl disabled:opacity-20">Verify & Continue</button>
                
                <div className="flex flex-col items-center gap-3">
                  {timer > 0 ? (
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Resend in {timer}s</p>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <button type="button" onClick={() => setTimer(30)} className="text-[10px] text-brand font-black uppercase hover:underline">Resend SMS</button>
                      <button type="button" disabled={isProcessing} onClick={handleCallRequest} className="w-full py-3 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-gray-100">
                        {isProcessing ? 'Connecting...' : 'Receive Call with Code'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-10 text-center animate-in fade-in zoom-in-95">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
             </div>
             <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Identity Recovered</h2>
             <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mb-8 space-y-4 text-left">
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Login ID (Email)</p>
                   <p className="font-bold text-gray-900">{email || 'Not Set'}</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Temporary Password</p>
                   <p className="font-mono font-black text-brand text-xl">RECOVER123</p>
                </div>
             </div>
             <button onClick={() => setStep('details')} className="w-full py-5 bg-brand text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl">Back to Login</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
