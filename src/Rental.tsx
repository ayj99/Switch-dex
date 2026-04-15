import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Users, Globe, ThumbsUp, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Game, PHONE_NUMBER } from './types';

// Mock Data for Rental Options
const MODELS = [
  { id: 'v2', name: 'Switch V2', desc: '高性价比', price: 50 },
  { id: 'oled', name: 'Switch OLED', desc: '派对神机', price: 80 }
];

const PACKAGES = [
  { id: 'couple', name: '情侣双人套餐', desc: '2手柄', price: 20 },
  { id: 'party', name: '四人派对套餐', desc: '4手柄', price: 40 }
];

const ADDONS = [
  { id: 'pro', name: 'Pro 手柄', price: 15 },
  { id: 'ringfit', name: '健身环 (Ring Fit)', price: 25 },
  { id: 'bag', name: '旅行收纳包', price: 10 }
];

export default function Rental({ onBack }: { onBack: () => void }) {
  const [model, setModel] = useState<string | null>(null);
  const [pkg, setPkg] = useState<string | null>(null);
  const [addons, setAddons] = useState<string[]>([]);
  
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/games.json')
      .then(res => res.json())
      .then((data: Game[]) => {
        const rentalGames = data
          .filter(g => g.category && g.category.includes('租借'))
          .sort((a, b) => (b.votes || 0) - (a.votes || 0));
        setGames(rentalGames);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const totalPrice = useMemo(() => {
    let total = 0;
    if (model) total += MODELS.find(m => m.id === model)?.price || 0;
    if (pkg) total += PACKAGES.find(p => p.id === pkg)?.price || 0;
    addons.forEach(aId => {
      total += ADDONS.find(a => a.id === aId)?.price || 0;
    });
    return total;
  }, [model, pkg, addons]);

  const toggleAddon = (id: string) => {
    setAddons(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handleConsoleRent = () => {
    if (!model || !pkg) {
      alert("请先选择主机型号和套餐 / Please select a console model and package first.");
      return;
    }
    const modelName = MODELS.find(m => m.id === model)?.name;
    const pkgName = PACKAGES.find(p => p.id === pkg)?.name;
    const addonNames = addons.length > 0 
      ? addons.map(aId => ADDONS.find(a => a.id === aId)?.name).join(', ') 
      : 'None';
    
    const text = `Hi, I want to RENT ${modelName} + ${pkgName} with [${addonNames}]. Total Rental: RM ${totalPrice}`;
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleGameRent = (game: Game) => {
    const text = `Hi, I want to RENT the game: ${game.title} for RM 15/month.`;
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" className="w-9 h-9 rounded-full object-cover border-2 border-[#e60012]" alt="Logo" referrerPolicy="no-referrer" />
          <div className="flex flex-col">
            <span className="text-2xl font-black italic tracking-tighter text-gray-900 leading-none">
              S<span className="text-[#e60012]">✘</span>ítčh Dé<span className="text-[#e60012]">✘</span>
            </span>
            <span className="text-gray-500 text-[10px] font-bold tracking-widest mt-0.5">
              诗和远方与Switch奇妙
            </span>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-[#e60012] transition-colors bg-gray-100 hover:bg-red-50 px-4 py-2 rounded-full"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">返回大厅</span>
        </button>
      </header>

      {/* Console Rental Section */}
      <section className="p-5 max-w-4xl mx-auto w-full">
        <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
          <div className="w-1.5 h-5 bg-[#E60012] rounded-full"></div>
          主机套餐区 <span className="text-gray-400 text-sm font-bold">/ Console Rental</span>
        </h2>

        {/* Models */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-600 mb-3">1. 选择机型 (Pick Model)</h3>
          <div className="grid grid-cols-2 gap-3">
            {MODELS.map(m => (
              <motion.div
                key={m.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setModel(m.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${model === m.id ? 'border-[#E60012] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-black text-gray-900">{m.name}</span>
                  {model === m.id ? <CheckCircle2 className="text-[#E60012]" size={20} /> : <Circle className="text-gray-300" size={20} />}
                </div>
                <p className="text-xs text-gray-500 mb-2">{m.desc}</p>
                <p className="text-[#E60012] font-bold">RM {m.price} <span className="text-xs text-gray-400 font-normal">/ week</span></p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Packages */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-600 mb-3">2. 选择套餐 (Pick Package)</h3>
          <div className="grid grid-cols-2 gap-3">
            {PACKAGES.map(p => (
              <motion.div
                key={p.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPkg(p.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${pkg === p.id ? 'border-[#E60012] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-black text-gray-900">{p.name}</span>
                  {pkg === p.id ? <CheckCircle2 className="text-[#E60012]" size={20} /> : <Circle className="text-gray-300" size={20} />}
                </div>
                <p className="text-xs text-gray-500 mb-2">{p.desc}</p>
                <p className="text-[#E60012] font-bold">+ RM {p.price}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Addons */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-600 mb-3">3. 附加配件 (Add-ons)</h3>
          <div className="flex flex-col gap-2">
            {ADDONS.map(a => {
              const isSelected = addons.includes(a.id);
              return (
                <motion.div
                  key={a.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleAddon(a.id)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${isSelected ? 'border-[#E60012] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <div className="flex items-center gap-3">
                    {isSelected ? <CheckCircle2 className="text-[#E60012]" size={20} /> : <Circle className="text-gray-300" size={20} />}
                    <span className="font-bold text-gray-900">{a.name}</span>
                  </div>
                  <span className="text-[#E60012] font-bold">+ RM {a.price}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Game Rental Section */}
      <section className="p-5 max-w-4xl mx-auto w-full bg-gray-50 border-t border-gray-100 pb-32 flex-grow">
        <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
          <div className="w-1.5 h-5 bg-green-500 rounded-full"></div>
          纯游戏租借区 <span className="text-gray-400 text-sm font-bold">/ Game Rental</span>
        </h2>

        {isLoading ? (
          <div className="py-10 text-center text-gray-400 font-bold">Loading games...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {games.map(game => (
              <motion.div 
                key={game.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleGameRent(game)}
                className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm flex flex-col cursor-pointer relative"
              >
                {/* RENTAL Badge */}
                <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-md z-10 shadow-md flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  RENTAL
                </div>

                <div className="relative aspect-[3/4] w-full bg-gray-200">
                  <img 
                    src={game.imageUrl} 
                    alt={game.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="text-xs font-bold line-clamp-2 h-8 leading-tight text-gray-900">
                    {game.title}
                  </h3>
                  <div className="mt-auto pt-2 flex flex-col gap-1.5">
                    <div className="flex items-baseline gap-1.5">
                      <p className="text-green-600 font-black text-lg leading-none">
                        RM 15 <span className="text-xs font-bold text-gray-500">/ 月</span>
                      </p>
                    </div>
                    
                    {/* Players, Language, Votes */}
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium flex-wrap">
                      <span className="flex items-center gap-0.5"><Users size={10} /> {game.players}</span>
                      <span className="flex items-center gap-0.5 truncate"><Globe size={10} /> {game.language}</span>
                      <span className="flex items-center gap-0.5 text-[#E60012]"><ThumbsUp size={10} /> {game.votes}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Floating Checkout Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col w-full sm:w-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-gray-600">Total Rental:</span>
              <span className="text-2xl font-black text-[#E60012]">RM {totalPrice}</span>
            </div>
            <p className="text-[10px] sm:text-xs font-bold text-[#E60012] flex items-center gap-1">
              ⚠️ 另需押金 (Deposit)，归还后 24 小时内闪电退款
            </p>
          </div>
          
          <button 
            onClick={handleConsoleRent}
            className="w-full sm:w-auto bg-[#E60012] text-white px-8 py-3 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#E60012]/20 active:scale-95 transition-transform"
          >
            <MessageCircle size={22} fill="white" />
            WhatsApp 预订主机
          </button>
        </div>
      </footer>
    </div>
  );
}
