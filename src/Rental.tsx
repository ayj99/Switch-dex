import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Users, Globe, ThumbsUp, MessageCircle, Check, Minus, Search } from 'lucide-react';
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

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    games.forEach(g => {
      if (g.category) {
        g.category.split(',').forEach(c => {
          const cat = c.trim();
          if (cat !== '租借') cats.add(cat);
        });
      }
    });
    return ['All', 'Party', 'Action', 'RPG', ...Array.from(cats)].filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);
  }, [games]);

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || (game.category && game.category.includes(selectedCategory));
      return matchesSearch && matchesCategory;
    });
  }, [games, searchQuery, selectedCategory]);

  // Poster states
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [posterPage, setPosterPage] = useState(0);

  const posterGames = useMemo(() => {
    const startIndex = posterPage * 12;
    return filteredGames.slice(startIndex, startIndex + 12);
  }, [filteredGames, posterPage]);

  const totalPosterPages = Math.ceil(filteredGames.length / 12);

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
          <img src="/images/console.png" className="absolute inset-0 w-full h-full object-cover opacity-10 transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
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
          <img src="/images/rentalgames.png" className="absolute inset-0 w-full h-full object-cover opacity-10 transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
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
                <div className="w-full">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
                  {/* Left Card */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
                    <div className="aspect-square relative mb-6 rounded-2xl flex items-center justify-center p-4">
                      <img src="/images/switch1_basic.png" alt="Switch 1 Basic" className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
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
                        <img src="/images/switch1_party.png" alt="Switch 1 Party" className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 relative z-10" referrerPolicy="no-referrer" />
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
                      <img src="/images/switch1_pro.png" alt="Switch 1 Pro" className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
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

                {/* Visual Feature Comparison Matrix */}
                <div className="mt-20 max-w-5xl mx-auto">
                  <h2 className="text-2xl font-black text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
                    <span className="text-2xl">📦</span> What's in the Box / 套餐内容对比
                  </h2>
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
                    <div className="min-w-[700px] text-sm text-gray-800">
                      <div className="grid grid-cols-5 border-b border-gray-100 bg-gray-50/50 font-bold text-center items-center">
                        <div className="col-span-2 p-4 text-left pl-8 text-gray-400 font-semibold text-xs tracking-wider uppercase">Item Info</div>
                        <div className="p-4 text-gray-600">1 Day</div>
                        <div className="p-4 bg-green-50/80 text-green-900 h-full flex items-center justify-center">3 Days (Party)</div>
                        <div className="p-4 text-gray-600">7 Days (Pro)</div>
                      </div>
                      {/* Rows */}
                      {[
                        { img: 'thumb-console.png', text: 'Switch 主机', vals: [true, true, true] },
                        { img: 'thumb-dock.png', text: 'Dock + HDMI (连接电视)', vals: [true, true, true] },
                        { img: 'thumb-joycon.png', text: 'Joy-Con 控制器', vals: ['2 个', '4 个', '4 个'] },
                        { img: 'thumb-game.png', text: '任选 1 款游戏', vals: [true, '升级 20+ 款', '升级 20+ 款'] },
                        { img: 'thumb-games.png', text: '20+ 热门游戏 (情侣/派对)', vals: [false, true, true] },
                        { img: 'thumb-miniacc.png', text: '小型游戏配件 (方向盘/握把)', vals: [false, true, true] },
                        { img: 'thumb-sportsacc.png', text: '运动游戏配件', vals: [false, true, true] },
                        { img: 'thumb-largeacc.png', text: 'Ringfit / 太鼓 (大型外设)', vals: [false, false, '免费二选一'] },
                        { img: 'thumb-clean.png', text: '全面消毒 & 满电发出', vals: [true, true, true] },
                      ].map((row, i) => (
                        <div key={i} className="grid grid-cols-5 border-b border-gray-100 last:border-0 items-stretch hover:bg-gray-50/50 transition-colors">
                          <div className="col-span-2 p-4 pl-8 flex items-center gap-4">
                            <img src={`/images/${row.img}`} className="w-10 h-10 object-contain shrink-0" referrerPolicy="no-referrer" />
                            <span className="font-semibold text-gray-900">{row.text}</span>
                          </div>
                          <div className="p-4 flex items-center justify-center text-center">
                             {row.vals[0] === true ? <Check className="text-gray-900 w-5 h-5" /> : row.vals[0] === false ? <Minus className="text-gray-300 w-5 h-5" /> : <span className="font-semibold text-gray-600">{row.vals[0]}</span>}
                          </div>
                          <div className="p-4 flex items-center justify-center text-center bg-green-50/40">
                             {row.vals[1] === true ? <Check className="text-green-600 w-6 h-6" /> : row.vals[1] === false ? <Minus className="text-green-200 w-5 h-5" /> : <span className="font-bold text-green-700">{row.vals[1]}</span>}
                          </div>
                          <div className="p-4 flex items-center justify-center text-center">
                             {row.vals[2] === true ? <Check className="text-gray-900 w-5 h-5" /> : row.vals[2] === false ? <Minus className="text-gray-300 w-5 h-5" /> : <span className="font-semibold text-gray-600">{row.vals[2]}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
                  {/* Left Card */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full">
                    <div className="aspect-square relative mb-6 rounded-2xl flex items-center justify-center p-4">
                      <img src="/images/switch2_basic.png" alt="Switch 2 Basic" className="w-full h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
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
                        <img src="/images/switch2_party.png" alt="Switch 2 Party" className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500 relative z-10" referrerPolicy="no-referrer" />
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
                  <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                </video>
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                  <span>📺 How to Rent / 租借教程</span>
                </div>
              </div>

              {/* Restructured Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 mb-2">单租精选游戏</h1>
                  <p className="text-gray-500 font-medium">海量大作，随租随玩</p>
                </div>
                {/* Poster Gen Button Relocated here */}
                {!isLoading && games.length > 0 && (
                  <button 
                    onClick={() => {
                      setPosterPage(0);
                      setShowPosterModal(true);
                    }}
                    className="bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
                  >
                    View All Games
                  </button>
                )}
              </div>

              {/* Added Search & Filter UI Bar */}
              <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                <div className="relative w-full md:w-64 flex-shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search games..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all shadow-sm"
                  />
                </div>
                <div className="flex gap-2 w-full overflow-x-auto no-scrollbar pb-2 md:pb-0 hide-scrollbar-mobile">
                  {allCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-sm font-bold transition-colors whitespace-nowrap flex-shrink-0 ${
                        selectedCategory === cat 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                      } shadow-sm`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-4 border-gray-200 border-t-[#e60012] rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {filteredGames.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-gray-400 font-bold">
                      No games found.
                    </div>
                  ) : (
                    filteredGames.map(game => (
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
                  ))
                )}
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
                      src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
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

      {/* Poster Modal */}
      <AnimatePresence>
        {showPosterModal && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-start overflow-y-auto p-4 md:p-8"
          >
            {/* Close Button */}
            <div className="w-full max-w-[800px] flex justify-end mb-4 flex-shrink-0 mt-4 md:mt-0">
              <button 
                onClick={() => setShowPosterModal(false)}
                className="text-white font-black tracking-widest text-xs md:text-sm bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2"
              >
                ✕ CLOSE STUDIO
              </button>
            </div>

            {/* Poster Canvas */}
            <div 
              className="w-full max-w-[800px] bg-[#e60012] rounded-2xl md:rounded-3xl shadow-2xl flex flex-col relative overflow-hidden flex-shrink-0 mb-4"
            >
              {/* White Header Banner */}
              <div className="bg-white px-5 py-4 md:px-8 md:py-6 flex items-center justify-between relative z-20 border-b-4 border-gray-900">
                <div className="flex items-center gap-2 md:gap-3">
                  <img src="/images/logo.png" className="w-10 h-10 md:w-14 md:h-14 rounded-full object-cover border-2 border-[#e60012] flex-shrink-0" alt="Logo" referrerPolicy="no-referrer" onError={(e) => e.currentTarget.style.display = 'none'} />
                  <div className="flex flex-col">
                    <span className="text-2xl md:text-4xl font-black italic tracking-tighter text-gray-900 leading-none">
                      S<span className="text-[#e60012]">✘</span>ítčh Dé<span className="text-[#e60012]">✘</span>
                    </span>
                    <span className="text-gray-500 text-[10px] md:text-sm font-bold tracking-widest mt-0.5">
                      海量大作随租随玩
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl md:text-3xl text-[#e60012] tracking-tighter uppercase drop-shadow-sm">
                    单租系列精选
                  </p>
                </div>
              </div>

              {/* Black / Red Content Area */}
              <div className="p-5 md:p-8 relative flex-grow flex flex-col">
                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none mix-blend-overlay"></div>

                {/* Grid Container */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-3 relative z-10 content-start">
                  {posterGames.map((game) => (
                    <div 
                      key={game.id} 
                      className="bg-white rounded-xl p-1.5 md:p-3 flex flex-col shadow-xl relative w-[calc(25%-6px)] md:w-[calc(25%-9px)]"
                    >
                      {/* Condition Tag */}
                      <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-gray-900 text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 rounded z-10 shadow-sm">
                        {game.condition}
                      </div>
                      
                      <img 
                        src={game.imageUrl} 
                        alt={game.title} 
                        className="w-full aspect-[3/4] object-cover rounded-lg mb-1.5 md:mb-2 shadow-sm" 
                        referrerPolicy="no-referrer"
                      />
                      
                      <h3 className="text-[9px] md:text-xs font-bold truncate text-gray-900 mb-0.5 md:mb-1">
                        {game.title}
                      </h3>
                      
                      <div className="mt-auto">
                        <div className="flex items-baseline gap-1 mt-0.5 md:mt-1 border-t border-gray-100 pt-1 md:pt-1.5">
                          <p className="text-[#25D366] font-black text-xs md:text-base leading-none">
                            RM {Math.floor(game.price * 0.07)}<span className="text-[8px] md:text-[10px] text-gray-500 font-bold">/月起</span>
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 mt-1 text-[8px] md:text-[10px] text-gray-400 font-medium hidden md:flex">
                          <span className="flex items-center gap-0.5 truncate"><Globe size={8} /> {game.language}</span>
                          <span className="flex items-center gap-0.5 ml-auto text-[#25D366]"><ThumbsUp size={8} /> {game.votes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 md:mt-8 flex justify-between items-end border-t border-white/20 pt-4 relative z-10">
                  <div className="text-white">
                    <p className="font-black text-xs md:text-sm tracking-widest opacity-90 drop-shadow-sm">SCREENSHOT TO SHARE</p>
                    <p className="text-[8px] md:text-xs opacity-75 mt-0.5 font-medium">Capture this image to share the games list</p>
                  </div>
                  <div className="text-right text-white">
                    <p className="font-black text-xs md:text-sm opacity-90 drop-shadow-sm">PAGE {posterPage + 1}/{totalPosterPages}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPosterPages > 1 && (
              <div className="flex items-center gap-4 mt-4 flex-shrink-0">
                <button 
                  onClick={() => setPosterPage(p => Math.max(0, p - 1))}
                  disabled={posterPage === 0}
                  className="bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white p-3 rounded-full backdrop-blur-md transition-all"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="text-white font-mono font-bold text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                  Page {posterPage + 1} of {totalPosterPages}
                </div>
                <button 
                  onClick={() => setPosterPage(p => Math.min(totalPosterPages - 1, p + 1))}
                  disabled={posterPage === totalPosterPages - 1}
                  className="bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10 text-white p-3 rounded-full backdrop-blur-md transition-all"
                >
                  <ArrowLeft size={24} className="rotate-180" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
