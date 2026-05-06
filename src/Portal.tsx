import React from 'react';
import { motion } from 'motion/react';
import { Gamepad2, Package } from 'lucide-react';

export default function Portal({ onNavigate }: { onNavigate: (view: 'shop' | 'rental') => void }) {
  return (
    <div className="min-h-[85vh] bg-[#F8F9FA] flex flex-col items-center justify-center p-6">
      {/* Brand VI */}
      <div className="flex flex-col items-center mb-12 text-center">
        <img src="/images/logo.png" className="w-20 h-20 rounded-full object-cover border-4 border-[#e60012] mb-4 shadow-lg" alt="Logo" referrerPolicy="no-referrer" />
        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-gray-900 leading-none text-center">
          S<span className="text-[#e60012]">✘</span>ítčh Dé<span className="text-[#e60012]">✘</span>
        </h1>
        <p className="text-gray-500 text-sm md:text-base font-bold tracking-widest mt-2">
          诗和远方与Switch奇妙
        </p>
        
        {/* Pikachu Greeting */}
        <div className="text-lg md:text-xl font-bold text-yellow-500 flex items-center justify-center gap-3 mt-6 bg-yellow-50 px-6 py-3 rounded-full border border-yellow-200 shadow-sm">
          <img src="/images/pikachu.gif" alt="Pikachu" className="w-8 h-8 object-contain" referrerPolicy="no-referrer" onError={(e) => e.currentTarget.style.display = 'none'} />
          <span>⚡️ 皮卡皮卡！今天想在 Switch 的世界里开启什么冒险呀？ 🐹</span>
        </div>
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
          <img src="/images/games.png" alt="Buy Games" className="w-32 h-32 mx-auto mb-4 object-contain transition-transform group-hover:scale-110 drop-shadow-xl" />
          <h2 className="text-2xl font-black text-gray-900 mb-4">买 Switch 二手游戏</h2>
          <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed">
            涵盖全分类神作！天天有闪购特价 ⚡，配合「高价回血」计划，怎么买都不亏！
          </p>
        </motion.button>

        {/* Rental Card */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNavigate('rental')}
          className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border border-gray-100 flex flex-col items-center text-center group"
        >
          <img src="/images/console.png" alt="Rent Console" className="w-32 h-32 mx-auto mb-4 object-contain transition-transform group-hover:scale-110 drop-shadow-xl" />
          <h2 className="text-2xl font-black text-gray-900 mb-4">租 Switch 主机与游戏</h2>
          <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed">
            周末聚会、拍拖破冰神器！全套神机即租即玩，精选大作低至一杯奶茶钱 🎉！
          </p>
        </motion.button>
      </div>
    </div>
  );
}
