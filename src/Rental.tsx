import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Users, Globe, ThumbsUp, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [rentalMode, setRentalMode] = useState<'curtain' | 'console' | 'games'>('curtain');
  
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
    const minPrice = Math.floor(game.price * 0.0667);
    const maxPrice = Math.floor(game.price * 0.15);
    const text = `Hi, I want to RENT ${game.title}. I saw the rental range is RM ${minPrice} - ${maxPrice}/month. Please let me know the details.`;
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (rentalMode === 'curtain') {
    return (
      <div className="h-screen w-full flex flex-col relative font-sans overflow-hidden">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 z-50 flex items-center gap-1 text-sm font-bold text-white/80 hover:text-white bg-black/20 hover:bg-black/40 px-3 py-2 rounded-full backdrop-blur-md transition-all"
        >
          <ArrowLeft size={20} />
          <span>返回大厅</span>
        </button>

        {/* Top Half: Console */}
        <div 
          onClick={() => setRentalMode('console')}
          className="h-1/2 w-full bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 flex items-center justify-center cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative z-10 text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-2xl">
              📦 租 Switch 主机套餐
            </h1>
            <p className="text-purple-200 mt-4 text-lg md:text-xl font-medium opacity-80 group-hover:opacity-100 transition-opacity">
              周末聚会、拍拖破冰神器！全套神机即租即玩
            </p>
          </motion.div>
        </div>

        {/* Bottom Half: Games */}
        <div 
          onClick={() => setRentalMode('games')}
          className="h-1/2 w-full bg-gradient-to-tr from-red-900 via-red-800 to-black flex items-center justify-center cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative z-10 text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-2xl">
              🎮 单租精选游戏
            </h1>
            <p className="text-red-200 mt-4 text-lg md:text-xl font-medium opacity-80 group-hover:opacity-100 transition-opacity">
              精选大作低至一杯奶茶钱 🎉！
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={() => setRentalMode('curtain')}
          className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-black transition-colors w-32"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">返回选择模式</span>
        </button>
        
        <div className="flex items-center justify-center gap-2 flex-1">
          <img src="/images/logo.png" className="w-9 h-9 rounded-full object-cover border-2 border-[#e60012]" alt="Logo" referrerPolicy="no-referrer" />
          <div className="flex flex-col">
            <span className="text-2xl font-black italic tracking-tighter text-gray-900 leading-none">
              S<span className="text-[#e60012]">✘</span>ítčh Dé<span className="text-[#e60012]">✘</span>
            </span>
          </div>
        </div>
        
        <div className="w-32" /> {/* Spacer for centering */}
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={rentalMode}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex-1"
        >
          {rentalMode === 'console' && (
            <div className="max-w-4xl mx-auto px-4 py-8 pb-32">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-gray-900 mb-2">定制你的 Switch 租赁套餐</h1>
                <p className="text-gray-500 font-medium">只需 3 步，开启快乐周末</p>
              </div>

              <div className="space-y-8">
                {/* Step 1: Model */}
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                    选择主机型号
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {MODELS.map(m => (
                      <div 
                        key={m.id}
                        onClick={() => setModel(m.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${model === m.id ? 'border-[#e60012] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{m.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{m.desc}</p>
                          </div>
                          {model === m.id ? <CheckCircle2 className="text-[#e60012]" /> : <Circle className="text-gray-300" />}
                        </div>
                        <div className="mt-4 text-right">
                          <span className="text-xl font-black text-[#e60012]">RM {m.price}</span>
                          <span className="text-xs text-gray-500"> / 天</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Step 2: Package */}
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                    选择手柄套餐
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {PACKAGES.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => setPkg(p.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${pkg === p.id ? 'border-[#e60012] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{p.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{p.desc}</p>
                          </div>
                          {pkg === p.id ? <CheckCircle2 className="text-[#e60012]" /> : <Circle className="text-gray-300" />}
                        </div>
                        <div className="mt-4 text-right">
                          <span className="text-xl font-black text-[#e60012]">+ RM {p.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Step 3: Addons */}
                <section>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                    加购配件 (可选)
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {ADDONS.map(a => {
                      const isSelected = addons.includes(a.id);
                      return (
                        <div 
                          key={a.id}
                          onClick={() => toggleAddon(a.id)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">{a.name}</h3>
                            {isSelected ? <CheckCircle2 className="text-black" size={20} /> : <Circle className="text-gray-300" size={20} />}
                          </div>
                          <div className="mt-2">
                            <span className="font-bold text-gray-900">+ RM {a.price}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              {/* Bottom Action Bar */}
              <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe z-40">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium">总计预估</p>
                    <p className="text-2xl font-black text-[#e60012]">RM {totalPrice} <span className="text-sm text-gray-500 font-normal">/ 天</span></p>
                  </div>
                  <button 
                    onClick={handleConsoleRent}
                    className="bg-[#e60012] hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg shadow-red-500/30 transition-all transform hover:scale-105 active:scale-95"
                  >
                    立即预约
                  </button>
                </div>
              </div>
            </div>
          )}

          {rentalMode === 'games' && (
            <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
              <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-gray-900 mb-2">单租精选游戏</h1>
                <p className="text-gray-500 font-medium">海量大作，随租随玩</p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-[#e60012] rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {games.map(game => (
                    <div key={game.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                        <img 
                          src={game.imageUrl} 
                          alt={game.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <Users size={10} /> {game.players}
                        </div>
                      </div>
                      
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-2 mb-2 group-hover:text-[#e60012] transition-colors">
                          {game.title}
                        </h3>
                        <div className="mt-auto pt-2 flex flex-col gap-1.5">
                          <div className="flex items-baseline gap-1.5">
                            <p className="text-green-600 font-black text-sm leading-none">
                              RM {Math.floor(game.price * 0.0667)} - {Math.floor(game.price * 0.15)} <span className="text-[10px] font-bold text-gray-500">/ 月</span>
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium mt-1">
                            <span className="flex items-center gap-1"><ThumbsUp size={10} /> {game.votes}</span>
                            <span className="flex items-center gap-1"><MessageCircle size={10} /> 99+</span>
                          </div>

                          <button 
                            onClick={() => handleGameRent(game)}
                            className="mt-3 w-full bg-gray-900 hover:bg-black text-white py-2 rounded-xl text-sm font-bold transition-colors"
                          >
                            我要租
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
