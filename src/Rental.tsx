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
  const [rentalMode, setRentalMode] = useState<'curtain' | 'console' | 'games' | 'gameDetail'>('curtain');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  
  const [consoleType, setConsoleType] = useState<'switch1' | 'switch2'>('switch1');
  const [timing, setTiming] = useState<'weekday' | 'weekend'>('weekday');
  
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

  const handleConsoleRent = (planName: string, price: number) => {
    const text = `Hi, I want to RENT ${planName}. Total Rental: RM ${price}`;
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleGameRent = (game: Game) => {
    const minPrice = Math.floor(game.price * 0.07);
    const maxPrice = Math.floor(game.price * 0.10);
    const text = `Hi, I want to RENT ${game.title}. I saw the rental range is RM ${minPrice} - ${maxPrice}/month. Please let me know the details.`;
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (rentalMode === 'curtain') {
    return (
      <div className="h-screen w-full flex flex-col relative font-sans overflow-hidden bg-gradient-to-b from-white via-gray-50 to-gray-100">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 z-50 flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back 返回大厅</span>
        </button>

        {/* Top Half: Console */}
        <div 
          onClick={() => setRentalMode('console')}
          className="flex-1 w-full flex items-center justify-center cursor-pointer group relative overflow-hidden border-b border-gray-200"
        >
          <img src="/images/console.png" className="absolute inset-0 w-full h-full object-cover opacity-10 transition-transform duration-700 group-hover:scale-105" />
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative z-10 text-center"
          >
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter drop-shadow-sm">
              RENT CONSOLES
            </h1>
          </motion.div>
        </div>

        {/* Bottom Half: Games */}
        <div 
          onClick={() => setRentalMode('games')}
          className="flex-1 w-full flex items-center justify-center cursor-pointer group relative overflow-hidden"
        >
          <img src="/images/rentalgames.png" className="absolute inset-0 w-full h-full object-cover opacity-10 transition-transform duration-700 group-hover:scale-105" />
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="relative z-10 text-center"
          >
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter drop-shadow-sm">
              RENT GAMES ONLY
            </h1>
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
          <span className="hidden sm:inline">Back 返回选择</span>
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
            <div className="max-w-7xl mx-auto px-4 py-8 pb-32">
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 tracking-tight">Choose Your Console</h1>
                
                {/* Toggles */}
                <div className="flex flex-col items-center gap-4">
                  {/* Console Type Toggle */}
                  <div className="bg-gray-100 p-1 rounded-full inline-flex">
                    <button 
                      onClick={() => setConsoleType('switch1')}
                      className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${consoleType === 'switch1' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Nintendo Switch
                    </button>
                    <button 
                      onClick={() => setConsoleType('switch2')}
                      className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${consoleType === 'switch2' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Switch 2 (Next Gen)
                    </button>
                  </div>

                  {/* Timing Toggle */}
                  <div className="bg-gray-100 p-1 rounded-full inline-flex">
                    <button 
                      onClick={() => setTiming('weekday')}
                      className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${timing === 'weekday' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Weekday (Mon-Thu)
                    </button>
                    <button 
                      onClick={() => setTiming('weekend')}
                      className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${timing === 'weekend' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                      Weekend (Fri-Sun)
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid */}
              {consoleType === 'switch1' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
                  {/* Left Card */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
                    <div className="aspect-square relative mb-6 rounded-2xl flex items-center justify-center p-4">
                      <img src="/images/switch1_basic.png" alt="Switch 1 Basic" className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl font-black text-gray-900 mb-1">1 Day</h3>
                      <p className="text-sm text-gray-500 font-medium mb-4">(Inducement / 诱饵)</p>
                      <p className="text-sm text-gray-600 mb-6 flex-1">Includes: Console + Basic Joy-Cons.</p>
                      <div className="mb-6">
                        <p className="text-3xl font-black text-gray-900">RM {timing === 'weekday' ? 30 : 40}</p>
                      </div>
                      <button 
                        onClick={() => handleConsoleRent('Switch 1 - 1 Day', timing === 'weekday' ? 30 : 40)}
                        className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>

                  {/* Center Card */}
                  <div className="bg-white rounded-3xl p-1 border border-gray-200 shadow-2xl relative transform md:-translate-y-4 flex flex-col h-full z-10 ring-4 ring-gray-900/5">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-1 rounded-full text-xs font-black tracking-wider whitespace-nowrap shadow-lg z-20">
                      🔥 PARTY FAVORITE / 聚会首选
                    </div>
                    <div className="bg-white rounded-[22px] p-6 flex flex-col h-full">
                      <div className="aspect-square relative mb-6 rounded-2xl flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 rounded-2xl"></div>
                        <img src="/images/switch1_party.png" alt="Switch 1 Party" className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 relative z-10" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-2xl font-black text-gray-900 mb-1">3 Days</h3>
                        <p className="text-sm text-gray-500 font-medium mb-4">(Most Popular)</p>
                        <p className="text-sm text-gray-600 mb-4 flex-1">Includes: Full Bundle + Extra Controllers + Game Cases.</p>
                        <div className="mb-6">
                          <p className="text-4xl font-black text-gray-900">RM {timing === 'weekday' ? 99 : 128}</p>
                          <p className="text-sm font-bold text-green-600 mt-2 bg-green-50 inline-block px-2 py-1 rounded-md">🎓 Student Promo: RM {timing === 'weekday' ? 88 : 118} (Show ID)</p>
                        </div>
                        <button 
                          onClick={() => handleConsoleRent('Switch 1 - 3 Days Party', timing === 'weekday' ? 99 : 128)}
                          className="w-full bg-[#e60012] hover:bg-red-700 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-red-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Card */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
                    <div className="aspect-square relative mb-6 rounded-2xl flex items-center justify-center p-4">
                      <img src="/images/switch1_pro.png" alt="Switch 1 Pro" className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl font-black text-gray-900 mb-1">7 Days</h3>
                      <p className="text-sm text-gray-500 font-medium mb-4">(Deep Player / 深度玩家)</p>
                      <p className="text-sm text-gray-600 mb-6 flex-1">Includes: Full Bundle + Random Premium Accessories.</p>
                      <div className="mb-6">
                        <p className="text-3xl font-black text-gray-900">RM {timing === 'weekday' ? 199 : 238}</p>
                      </div>
                      <button 
                        onClick={() => handleConsoleRent('Switch 1 - 7 Days Pro', timing === 'weekday' ? 199 : 238)}
                        className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
                  {/* Left Card */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
                    <div className="aspect-square relative mb-6 rounded-2xl flex items-center justify-center p-4">
                      <img src="/images/switch2_basic.png" alt="Switch 2 Basic" className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-xl font-black text-gray-900 mb-1">1 Day</h3>
                      <p className="text-sm text-gray-500 font-medium mb-4">(Next Gen Experience)</p>
                      <p className="text-sm text-gray-600 mb-6 flex-1">Includes: Console + Basic Joy-Cons.</p>
                      <div className="mb-6">
                        <p className="text-3xl font-black text-gray-900">RM {timing === 'weekday' ? 60 : 80}</p>
                      </div>
                      <button 
                        onClick={() => handleConsoleRent('Switch 2 - 1 Day', timing === 'weekday' ? 60 : 80)}
                        className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>

                  {/* Center Card */}
                  <div className="bg-white rounded-3xl p-1 border border-gray-200 shadow-2xl relative transform md:-translate-y-4 flex flex-col h-full z-10 ring-4 ring-gray-900/5">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-1 rounded-full text-xs font-black tracking-wider whitespace-nowrap shadow-lg z-20">
                      🔥 PRE-ORDER / 稀缺体验·限量 1 台
                    </div>
                    <div className="bg-white rounded-[22px] p-6 flex flex-col h-full">
                      <div className="aspect-square relative mb-6 rounded-2xl flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 rounded-2xl"></div>
                        <img src="/images/switch2_party.png" alt="Switch 2 Party" className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 relative z-10" />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <h3 className="text-2xl font-black text-gray-900 mb-1">3-4 Days</h3>
                        <p className="text-sm text-gray-500 font-medium mb-4">(Limited Stock)</p>
                        <p className="text-sm text-gray-600 mb-4 flex-1">Includes: Full Bundle + Premium Accessories.</p>
                        <div className="mb-6">
                          <p className="text-4xl font-black text-gray-900">RM {timing === 'weekday' ? 150 : 199}</p>
                          <p className="text-sm font-bold text-green-600 mt-2 bg-green-50 inline-block px-2 py-1 rounded-md">🎓 Student Promo: RM {timing === 'weekday' ? 130 : 170} (Show ID)</p>
                        </div>
                        <button 
                          onClick={() => handleConsoleRent('Switch 2 - 3-4 Days Pre-order', timing === 'weekday' ? 150 : 199)}
                          className="w-full bg-[#e60012] hover:bg-red-700 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-red-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {rentalMode === 'games' && (
            <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
              {/* Video Header */}
              <div className="mb-10 rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-black aspect-video relative max-w-4xl mx-auto">
                <video 
                  className="w-full h-full object-cover opacity-80"
                  controls
                  poster="/images/rentalgames.png"
                >
                  <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                </video>
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                  <span>📺 How to Rent / 租借教程</span>
                </div>
              </div>

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
                    <div 
                      key={game.id} 
                      onClick={() => {
                        setSelectedGame(game);
                        setRentalMode('gameDetail');
                      }}
                      className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                        <img 
                          src={game.imageUrl} 
                          alt={game.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 bg-[#25D366] text-white text-[10px] font-black px-2 py-1 rounded-full shadow-md">
                          🟢 RENT 租
                        </div>
                      </div>
                      
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-2 mb-2 group-hover:text-[#e60012] transition-colors">
                          {game.title}
                        </h3>
                        <div className="mt-auto pt-2 flex flex-col gap-1.5">
                          <div className="flex items-baseline gap-1.5">
                            <p className="text-green-600 font-black text-sm leading-none">
                              RM {Math.floor(game.price * 0.07)} - {Math.floor(game.price * 0.10)} <span className="text-[10px] font-bold text-gray-500">/ 月</span>
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium mt-1">
                            <span className="flex items-center gap-1"><ThumbsUp size={10} /> {game.votes}</span>
                            <span className="flex items-center gap-1"><MessageCircle size={10} /> 99+</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {rentalMode === 'gameDetail' && selectedGame && (() => {
            const min = Math.floor(selectedGame.price * 0.07);
            const max = Math.floor(selectedGame.price * 0.10);
            
            return (
              <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
                <button 
                  onClick={() => setRentalMode('games')}
                  className="mb-6 flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-black transition-colors"
                >
                  <ArrowLeft size={20} />
                  <span>Back to Games</span>
                </button>

                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="aspect-video w-full bg-black relative">
                    <video 
                      src="https://www.w3schools.com/html/mov_bbb.mp4" 
                      controls 
                      poster={selectedGame.imageUrl} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-tight">
                      {selectedGame.title}
                    </h1>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Users size={12} /> {selectedGame.players || '1-4'} 人
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Globe size={12} /> {selectedGame.language || '中/英'}
                      </span>
                      {selectedGame.category?.split(',').map((cat, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                          {cat.trim()}
                        </span>
                      ))}
                    </div>
                    
                    {selectedGame.description && (
                      <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        {selectedGame.description}
                      </p>
                    )}
                    
                    {/* 1. Headline Price Strategy */}
                    <div className="mb-2">
                      <p className="text-green-600 font-black text-3xl md:text-4xl flex items-center gap-2">
                        RM {min} - {max} <span className="text-lg font-bold text-gray-500">/ month</span>
                      </p>
                    </div>

                    {/* 2. Refined T&C Box (Scannable Visual Hierarchy) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mt-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-black text-gray-900">📌 Rental Rates / 租借价格与退款</h3>
                        <p className="text-gray-800 text-sm font-normal mt-1">Pay the full price as a deposit. Get refunded based on how long you play! 支付全款作押金，退回时根据时长按比例退款！</p>
                      </div>
                      
                      <div className="space-y-2 mb-5">
                        <div className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="w-32">📅 30 Days / 天</span>
                          <span className="text-gray-800">回购退 90%</span>
                          <span className="text-gray-500">(现金退 85%)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="w-32">📅 60 Days / 天</span>
                          <span className="text-gray-800">回购退 85%</span>
                          <span className="text-gray-500">(现金退 80%)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="w-32">📅 90 Days / 天</span>
                          <span className="text-gray-800">回购退 75%</span>
                          <span className="text-gray-500">(现金退 70%)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="w-32">📅 120 Days / 天</span>
                          <span className="text-gray-800">回购退 70%</span>
                          <span className="text-gray-500">(现金退 65%)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="w-32">📅 150 Days / 天</span>
                          <span className="text-gray-800">回购退 65%</span>
                          <span className="text-gray-500">(现金退 60%)</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-5 border-t border-gray-100">
                        <ul className="space-y-2 text-xs text-gray-500 font-normal">
                          <li className="flex items-start gap-1.5">
                            <span>1.</span>
                            <div className="flex flex-col leading-tight">
                              <span>Deposit: Full game price + RM 5 activation fee upon order.</span>
                              <span>押金: 付原价作为押金 + RM5 开启服务费，下单时确认。</span>
                            </div>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span>2.</span>
                            <div className="flex flex-col leading-tight">
                              <span>Shipping: Buyer bears return shipping costs.</span>
                              <span>物流: 卡带需自行寄回，邮费由买家承担。</span>
                            </div>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span>3.</span>
                            <div className="flex flex-col leading-tight">
                              <span>Condition: Cartridge must be in good working condition. Penalties apply for damage.</span>
                              <span>卡况: 卡带必须完好、正常使用；如有损坏将视情况扣除。</span>
                            </div>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span>4.</span>
                            <div className="flex flex-col leading-tight">
                              <span>Timeframe: Refund rate depends on the postmark date of return.</span>
                              <span>时效: 退款金额取决于寄出时间。</span>
                            </div>
                          </li>
                          <li className="flex items-start gap-1.5">
                            <span>5.</span>
                            <div className="flex flex-col leading-tight">
                              <span>Refund: Choose Game Swap (Full rate) or Cash Refund. *Note: Cash refund deducts an extra 5%.</span>
                              <span>退款: 退款方式二选一（换游戏享全额比例，选现金转账额外扣除 5%）。</span>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. CTA Button */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe z-40 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                  <div className="max-w-2xl mx-auto">
                    <button 
                      onClick={() => {
                        const text = `Hi, I want to rent ${selectedGame.title} for (RM ${min}-${max}/month range). Please let me know the total upfront payment.`;
                        window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      📱 Rent for RM {min}-{max} / mo - Chat Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
