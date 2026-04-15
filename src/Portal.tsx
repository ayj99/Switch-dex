import React from 'react';
import { motion } from 'motion/react';
import { Gamepad2, Package } from 'lucide-react';

export default function Portal({ onNavigate }: { onNavigate: (view: 'shop' | 'rental') => void }) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6">
      {/* Brand VI */}
      <div className="flex flex-col items-center mb-12">
        <img src="/images/logo.png" className="w-20 h-20 rounded-full object-cover border-4 border-[#e60012] mb-4 shadow-lg" alt="Logo" />
        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-gray-900 leading-none text-center">
          S<span className="text-[#e60012]">✘</span>ítčh Dé<span className="text-[#e60012]">✘</span>
        </h1>
        <p className="text-gray-500 text-sm md:text-base font-bold tracking-widest mt-2">
          诗和远方与Switch奇妙
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Shop Card */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('shop')}
          className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border border-gray-100 flex flex-col items-center text-center group"
        >
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#e60012] transition-colors">
            <Gamepad2 size={40} className="text-[#e60012] group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">🎮 游戏续杯商城</h2>
          <p className="text-gray-500 font-medium leading-relaxed">买断保值，高价回收<br/>一杯奶茶钱玩遍全库</p>
        </motion.button>

        {/* Rental Card */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('rental')}
          className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border border-gray-100 flex flex-col items-center text-center group"
        >
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
            <Package size={40} className="text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-3">📦 主机租借中心</h2>
          <p className="text-gray-500 font-medium leading-relaxed">全套配件，即租即玩<br/>派对聚会不二之选</p>
        </motion.button>
      </div>
    </div>
  );
}
