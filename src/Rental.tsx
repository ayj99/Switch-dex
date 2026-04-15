import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function Rental({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-[#e60012] transition-colors w-[88px]"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">返回大厅</span>
        </button>
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" className="w-9 h-9 rounded-full object-cover border-2 border-[#e60012]" alt="Logo" />
          <div className="flex flex-col">
            <span className="text-2xl font-black italic tracking-tighter text-gray-900 leading-none">
              S<span className="text-[#e60012]">✘</span>ítčh Dé<span className="text-[#e60012]">✘</span>
            </span>
            <span className="text-gray-500 text-[10px] font-bold tracking-widest mt-0.5">
              诗和远方与Switch奇妙
            </span>
          </div>
        </div>
        <div className="w-[88px]"></div> {/* Spacer for centering */}
      </header>

      <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-black text-gray-900 mb-4">Rental Center Coming Soon...</h1>
        <p className="text-gray-500">We are building the complex rental logic in Step 2.</p>
      </div>
    </div>
  );
}
