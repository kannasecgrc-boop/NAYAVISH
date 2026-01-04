
import React from 'react';

interface InstallPwaBannerProps {
  installPrompt: any;
  onInstall: () => void;
  onDismiss: () => void;
}

const InstallPwaBanner: React.FC<InstallPwaBannerProps> = ({ installPrompt, onInstall, onDismiss }) => {
  if (!installPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom-10">
      <div className="max-w-md mx-auto bg-gray-900 text-white rounded-3xl p-5 shadow-2xl flex items-center justify-between border border-gray-800 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center text-lg font-black shadow-lg">
            M
          </div>
          <div>
            <h4 className="font-black text-sm uppercase tracking-wide">Install App</h4>
            <p className="text-[10px] text-gray-400 font-medium">Faster ordering, better experience.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onDismiss}
            className="p-2 text-gray-500 hover:text-white transition-colors"
            aria-label="Close install banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <button 
            onClick={onInstall}
            className="px-5 py-2.5 bg-white text-gray-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand hover:text-white transition-all shadow-lg"
          >
            Get App
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPwaBanner;
