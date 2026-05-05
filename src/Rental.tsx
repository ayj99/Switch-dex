import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Users, Globe, ThumbsUp, MessageCircle, Check, Minus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Game, PHONE_NUMBER } from './types';
import PosterGenerator from './components/PosterGenerator';

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

export default function Rental({ onBack, initialGame, onClearInitialGame }: { onBack: () => void, initialGame?: Game | null, onClearInitialGame?: () => void }) {
  const [rentalMode, setRentalMode] = useState<'games' | 'console' | 'gameDetail'>(initialGame ? 'gameDetail' : 'games');
  const [selectedGame, setSelectedGame] = useState<Game | null>(initialGame || null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // When initialGame changes externally, update state (fallback in case component was already mounted)
  useEffect(() => {
    if (initialGame) {
      setSelectedGame(initialGame);
      setRentalMode('gameDetail');
    }
  }, [initialGame]);

  const handleBackToGames = () => {
    setRentalMode('games');
    if (onClearInitialGame) onClearInitialGame();
  };
  
  const [consoleType, setConsoleType] = useState<'switch1' | 'switch2'>('switch1');
  
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const CATEGORIES = ['All', 'Multiplayer多人', '单人Single', '运动sport', '情侣couple', '家庭Kids'];
  const GENRES = ['All', '动作冒险', '角色扮演', '模拟经营', '派对休闲', '运动竞速', '解谜策略', '格斗', '平台跳跃', '射击', '沙盒建造'];

  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || (game.category && game.category.includes(selectedCategory));
      const matchesGenre = selectedGenre === 'All' || (game.genre === selectedGenre);
      return matchesSearch && matchesCategory && matchesGenre;
    });
  }, [games, searchQuery, selectedCategory, selectedGenre]);

  // Poster states
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [generatingPosterDesign, setGeneratingPosterDesign] = useState<number | null>(null);
  const [posterImage, setPosterImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFeaturedExport = () => {
    setIsGenerating(true);
    setGeneratingPosterDesign(1);
  };

  const handlePosterGenerated = (imgUrl: string) => {
    setIsGenerating(false);
    setPosterImage(imgUrl);
    setGeneratingPosterDesign(null);
    setShowPosterModal(true);
  };

  const handlePosterError = (err: any) => {
    setIsGenerating(false);
    console.error('Failed to generate poster:', err);
    setGeneratingPosterDesign(null);
    alert('海报生成失败，请重试！(Error: ' + (err?.message || 'Unknown Error') + ')');
  };

  useEffect(() => {
    fetch('/games.json')
      .then(res => res.json())
      .then((data: Game[]) => {
        const rentalGames = data
          .filter(g => g.condition && g.condition.includes('租借'))
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
    const minPrice = Math.floor(game.price * 0.06);
    const maxPrice = Math.floor(game.price * 0.10);
    const text = `Hi, I want to RENT ${game.title}. I saw the rental range is RM ${minPrice} - ${maxPrice}/month. Please let me know the details.`;
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-black transition-colors w-32"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back 返回大厅</span>
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

      {/* Animated Segmented Control */}
      <div className="relative flex w-full max-w-md mx-auto bg-gray-100/80 backdrop-blur-md rounded-full p-1.5 shadow-inner mt-6 mb-8">
        <div 
          className={`absolute top-1.5 bottom-1.5 w-[calc(50%-0.375rem)] bg-white rounded-full shadow-md transition-transform duration-300 ease-out ${rentalMode === 'console' ? 'translate-x-full' : 'translate-x-0'}`} 
        />
        <button 
          onClick={() => setRentalMode('games')}
          className={`relative z-10 flex-1 flex items-center justify-center py-3 text-base md:text-lg font-bold transition-colors duration-300 ${rentalMode === 'games' ? 'text-gray-900' : 'text-gray-500'}`}
        >
          🎮 租游戏
        </button>
        <button 
          onClick={() => setRentalMode('console')}
          className={`relative z-10 flex-1 flex items-center justify-center py-3 text-base md:text-lg font-bold transition-colors duration-300 ${rentalMode === 'console' ? 'text-gray-900' : 'text-gray-500'}`}
        >
          🚀 租主机
        </button>
      </div>

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
                </div>
              </div>

              {/* Grid */}
              {consoleType === 'switch1' ? (
                <div className="w-full">
                  <div className="flex flex-col space-y-6 mt-6 md:flex-row md:space-y-0 md:space-x-6 max-w-6xl mx-auto px-4 md:px-0 items-stretch">
                  {/* Left Card - Option 1 */}
                  <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative flex flex-col">
                    <img src="/images/plan-1-day.jpg" className="w-full aspect-video object-cover rounded-t-xl mb-4" />
                    <div className="mb-6 flex-1">
                      <h3 className="text-xl font-black text-gray-900 mb-2">
                        📅 尝试一下
                        <span className="bg-blue-100 text-blue-600 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded-md ml-2 tracking-wide align-middle">👨🎓 学生价 - 10%</span>
                      </h3>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-4xl font-black text-gray-900">RM 50</span>
                        <span className="text-gray-500 font-medium">/ 1天</span>
                      </div>
                      <ul className="space-y-3 mb-6 text-gray-700 font-medium text-sm">
                        <li className="flex items-start gap-2"><span className="text-lg leading-tight">✅</span> <span>Switch 顶配主机全套 (含主机、底座、HDMI、电源)</span></li>
                        <li className="flex items-start gap-2"><span className="text-lg leading-tight">✅</span> <span>2 个 原装 Joy-Con 手柄</span></li>
                        <li className="flex items-start gap-2"><span className="text-lg leading-tight">✅</span> <span>10+ 款 热门游戏任选</span></li>
                      </ul>
                    </div>
                    
                    <button 
                      onClick={() => handleConsoleRent('Switch 1 - 1 Day', 50)}
                      className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-colors shadow-sm"
                    >
                      📱 立即预订
                    </button>
                  </div>

                  {/* Center Card - Option 2 */}
                  <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative flex flex-col">
                    <img src="/images/plan-3-days.jpg" className="w-full aspect-video object-cover rounded-t-xl mb-4" />
                    <div className="mb-6 flex-1">
                      <h3 className="text-xl font-black text-gray-900 mb-2">
                        📅 周末之王
                        <span className="bg-blue-100 text-blue-600 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded-md ml-2 tracking-wide align-middle">👨🎓 学生价 - 10%</span>
                      </h3>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-4xl font-black text-gray-900">RM 88</span>
                        <span className="text-gray-500 font-medium">/ 3天</span>
                      </div>
                      <ul className="space-y-3 mb-6 text-gray-700 font-medium text-sm">
                        <li className="flex items-start gap-2"><span className="text-lg leading-tight">✅</span> <span>Switch 顶配主机全套 (含主机、底座、HDMI、电源)</span></li>
                        <li className="flex items-start gap-2"><span className="text-lg leading-tight">✅</span> <span>4 个 原装 Joy-Con 手柄 (供4人同时游玩)</span></li>
                        <li className="flex items-start gap-2"><span className="text-lg leading-tight">✅</span> <span>20+ 款 热门精品游戏任选</span></li>
                        <li className="flex items-start gap-2"><span className="text-lg leading-tight">✅</span> <span>随机掉落：热门运动配件 (如马车方向盘/网球拍等)</span></li>
                      </ul>
                      <div className="mt-3 bg-red-50 border border-red-100 text-red-600 text-sm font-black p-2 rounded-lg text-center flex items-center justify-center gap-1 shadow-inner">
                        <span className="text-lg">🔥</span> 4人同玩，人均低至 RM 7.33 /天！
                      </div>
                    </div>

                    <button 
                      onClick={() => handleConsoleRent('Switch 1 - 3 Days', 88)}
                      className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-colors shadow-sm"
                    >
                      📱 立即预订
                    </button>
                  </div>

                  {/* Right Card - Option 3 (Highlighted!) */}
                  <div className="flex-1 border-4 border-red-500 bg-red-50/30 rounded-2xl p-6 relative shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-pulse-shadow transform md:scale-105 flex flex-col z-10">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-black tracking-widest shadow-md whitespace-nowrap z-20">
                      最推荐！性价比之王！
                    </div>
                    
                    <img src="/images/plan-7-days.jpg" className="w-full aspect-video object-cover rounded-t-xl mb-4 mt-2" />
                    
                    <div className="mb-6 flex-1">
                      <h3 className="text-2xl font-black text-gray-900 mb-2">
                        📅 深度畅玩
                        <span className="bg-blue-100 text-blue-600 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded-md ml-2 tracking-wide align-middle transform -translate-y-1 inline-block">👨🎓 学生价 - 10%</span>
                      </h3>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-5xl font-black text-red-600">RM 128</span>
                        <span className="text-gray-600 font-medium tracking-tight">/ 7天</span>
                      </div>
                      <ul className="space-y-3 mb-6 text-gray-800 font-bold text-sm">
                        <li className="flex items-start gap-2"><span className="text-lg leading-tight">✅</span> <span>Switch OLED 顶配主机全套 (随时切换主机/TV模式)</span></li>
                        <li className="flex items-start gap-2"><span className="text-lg leading-tight">✅</span> <span>4 个 原装 Joy-Con 手柄 (直接解锁4人派对！)</span></li>
                        <li className="flex items-start gap-2"><span className="text-lg leading-tight">✅</span> <span>30+ 款 热门大作任你畅玩</span></li>
                        <li className="flex items-start gap-2"><span className="text-lg leading-tight">✅</span> <span>运动配件大礼包</span></li>
                        <li className="flex items-start gap-2"><span className="text-lg leading-tight">✅</span> <span>重磅外设： 健身环大冒险 / 1:1 太鼓达人鼓 (二选一)</span></li>
                      </ul>
                      <div className="mt-3 bg-red-600 text-yellow-300 text-sm font-black p-3 rounded-lg text-center flex items-center justify-center gap-1 shadow-lg transform scale-105 border-2 border-red-700">
                        <span className="text-lg">🔥</span> 4人同玩，人均低至 RM 4.5 /天！
                      </div>
                    </div>

                    <button 
                      onClick={() => handleConsoleRent('Switch 1 - 7 Days', 128)}
                      className="w-full bg-[#e60012] hover:bg-red-700 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-red-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      📱 立即预订
                    </button>
                  </div>
                </div>

                {/* Monthly/Custom Banner */}
                <div className="mt-12 max-w-6xl mx-auto">
                    <div className="bg-gray-50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-center gap-4 mb-4 md:mb-0">
                        <div className="text-4xl bg-white p-3 rounded-full shadow-sm">🏆</div>
                        <div>
                          <p className="text-lg md:text-xl font-black text-gray-900 tracking-tight">Hardcore Gamer? Rent for 1 Month for only <span className="text-[#e60012]">RM 288</span>!</p>
                          <p className="text-gray-500 font-medium mt-1">Need custom dates? Chat with us ➔</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleConsoleRent('Switch 1 - 1 Month Custom', 288)}
                        className="w-full md:w-auto bg-white border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-xl font-black shadow-sm hover:bg-gray-900 hover:text-white transition-all whitespace-nowrap"
                      >
                        📱 Contact Us
                      </button>
                    </div>
                </div>

              </div>
              ) : (
                <div className="flex flex-col space-y-6 mt-6 md:flex-row md:space-y-0 md:space-x-6 max-w-5xl mx-auto px-4 md:px-0 items-stretch">
                  {/* Left Card */}
                  <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 relative flex flex-col">
                    <img src="/images/switch2_basic.png" className="w-full aspect-video object-cover rounded-t-xl mb-4" />
                    <div className="mb-6 flex-1">
                      <h3 className="text-xl font-black text-gray-900 mb-2">
                        1 Day 尝鲜体验
                        <span className="bg-blue-100 text-blue-600 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded-md ml-2 tracking-wide align-middle">👨🎓 学生价 - 10%</span>
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-gray-900">RM 60</span>
                        <span className="text-gray-500 font-medium">/ 1天</span>
                      </div>
                      <p className="text-xs font-bold text-gray-500 mt-2">Next Gen Experience</p>
                    </div>

                    <button 
                      onClick={() => handleConsoleRent('Switch 2 - 1 Day', 60)}
                      className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold transition-colors shadow-sm"
                    >
                      📱 Book 1 Day - RM 60
                    </button>
                  </div>

                  {/* Right Card (Highlighted!) */}
                  <div className="flex-1 border-2 border-red-500 bg-red-50/30 rounded-2xl p-6 relative shadow-md transform md:-translate-y-2 flex flex-col">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-4 py-1 rounded-full text-xs font-black tracking-widest shadow-sm whitespace-nowrap">
                      🔥 PRE-ORDER / 限量体验
                    </div>
                    
                    <img src="/images/switch2_party.png" className="w-full aspect-video object-cover rounded-t-xl mb-4 mt-2" />
                    
                    <div className="mb-6 flex-1">
                      <h3 className="text-2xl font-black text-gray-900 mb-2">
                        3-4 Days 深度体验
                        <span className="bg-blue-100 text-blue-600 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded-md ml-2 tracking-wide align-middle">👨🎓 学生价 - 10%</span>
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-red-600">RM 150</span>
                        <span className="text-gray-600 font-medium tracking-tight">/ 3-4天</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleConsoleRent('Switch 2 - 3-4 Days Pre-order', 150)}
                      className="w-full bg-[#e60012] hover:bg-red-700 text-white py-4 rounded-xl font-black text-lg shadow-lg shadow-red-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      📱 Pre-Order - RM 150
                    </button>
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
                    onClick={handleFeaturedExport}
                    disabled={isGenerating}
                    className="bg-gray-900 hover:bg-black disabled:opacity-50 text-white px-6 py-2.5 rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95 whitespace-nowrap flex items-center gap-2"
                  >
                    View All Games
                  </button>
                )}
              </div>

              {/* Added Search & Filter UI Bar */}
              <div className="flex flex-col gap-4 mb-8">
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
                
                {/* 第一层：优先的 Category (主场景/受众) - 用醒目的药丸按钮 */}
                <div className="flex gap-2 w-full overflow-x-auto hide-scrollbar pb-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-5 py-2 rounded-full text-sm font-black transition-colors whitespace-nowrap flex-shrink-0 ${
                        selectedCategory === cat 
                          ? 'bg-gray-900 text-white shadow-md' 
                          : 'bg-white border-2 border-gray-100 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* 第二层：次要的 Genre (核心玩法) - 用小号字体或浅色背景，降低视觉权重 */}
                <div className="flex gap-2 w-full overflow-x-auto hide-scrollbar pb-2">
                  {GENRES.map(genre => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex-shrink-0 ${
                        selectedGenre === genre 
                          ? 'bg-[#e60012] text-white' 
                          : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {genre}
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
                        {game.badge && (
                          <div className="absolute top-2 left-2 bg-[#E60012] text-white text-[10px] font-black px-2 py-1 rounded-md z-10 shadow-sm transform -skew-x-6">
                            {game.badge}
                          </div>
                        )}
                        {game.condition && game.condition.includes('租借') && (
                          <div className="absolute top-2 right-2 bg-[#25D366] text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(37,211,102,0.8)] border border-white/50 flex items-center gap-1 z-10 animate-pulse">
                            🟢 可租借
                          </div>
                        )}
                        <img 
                          src={game.imageUrl} 
                          alt={game.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div className="p-4 flex flex-col flex-1">
                        {game.subcategory && (
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                            {game.subcategory}
                          </span>
                        )}
                        <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-2 mb-2 group-hover:text-[#e60012] transition-colors">
                          {game.title}
                        </h3>
                        <div className="mt-auto pt-2 flex flex-col gap-1.5">
                          <div className="flex items-baseline gap-1.5">
                            <p className="text-[#E60012] font-black text-lg leading-none">
                              RM {game.price}
                            </p>
                            {game.originalPrice && (
                              <p className="text-gray-400 text-[10px] line-through font-bold">RM {game.originalPrice}</p>
                            )}
                          </div>
                          {game.condition && game.condition.includes('租借') && (
                            <div className="mt-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md text-center">
                              ✨ 租玩低至 RM {Math.floor(game.price * 0.06)}/月
                            </div>
                          )}
                          
                          <div className="flex items-center gap-3 text-[10px] text-gray-500 font-medium mt-1">
                            <span className="flex items-center gap-1"><Users size={10}/> {game.players || '1-4'}人</span>
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
            const min = Math.floor(selectedGame.price * 0.06);
            const max = Math.floor(selectedGame.price * 0.10);
            const discountedPrice = selectedGame.price;
            
            return (
              <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
                <button 
                  onClick={handleBackToGames}
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

                    {selectedGame.condition && selectedGame.condition.includes('租借') && (
                      <div className="bg-green-50/80 border-l-4 border-[#25D366] p-4 mb-6 rounded-r-2xl flex items-center justify-between shadow-sm backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse">
                            <span className="text-xl">🎮</span>
                          </div>
                          <div>
                            <h4 className="text-green-800 font-black text-lg leading-tight mb-0.5">支持低成本租玩！</h4>
                            <p className="text-green-600 text-[11px] font-bold">支付押金即可带走，闲置随时退回</p>
                          </div>
                        </div>
                        <div className="bg-white border-2 border-[#25D366] text-[#25D366] px-3 py-1.5 rounded-xl flex flex-col items-center shadow-sm">
                          <span className="text-[10px] font-black uppercase">低至</span>
                          <span className="text-sm font-black leading-none">RM {Math.floor(selectedGame.price * 0.06)}<span className="text-[10px]">/月</span></span>
                        </div>
                      </div>
                    )}

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
                        <h3 className="text-lg font-black text-gray-900">📌 Rental Rates / 租换价目表</h3>
                        <p className="text-gray-800 text-sm font-normal mt-1">Pay the full price as a deposit. The costs below are deducted based on playtime! (支付全款作押金，换租/退回时按以下租凭费扣除)</p>
                      </div>
                      
                      <div className="flex flex-col space-y-3 mt-4 mb-5">
                        {/* 30 Days */}
                        <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-100 hover:shadow-sm transition-all">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🔥</span>
                            <div className="text-base font-bold text-gray-800">30天内</div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-red-600 font-black text-lg">租凭费 RM {(discountedPrice * 0.1).toFixed(2)}</span>
                            <span className="text-green-600 text-[13px] font-bold mt-0.5">退回 90% (RM {(discountedPrice * 0.9).toFixed(2)})</span>
                          </div>
                        </div>

                        {/* 60 Days */}
                        <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-100 hover:shadow-sm transition-all">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🔥</span>
                            <div className="text-base font-bold text-gray-800">60天内</div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-red-600 font-black text-lg">租凭费 RM {(discountedPrice * 0.15).toFixed(2)}</span>
                            <span className="text-green-600 text-[13px] font-bold mt-0.5">退回 85% (RM {(discountedPrice * 0.85).toFixed(2)})</span>
                          </div>
                        </div>

                        {/* 90 Days */}
                        <div className="flex items-center justify-between p-4 bg-red-50/50 rounded-xl border border-red-100 hover:shadow-sm transition-all">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🔥</span>
                            <div className="text-base font-bold text-gray-800">90天内</div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-red-600 font-black text-lg">租凭费 RM {(discountedPrice * 0.25).toFixed(2)}</span>
                            <span className="text-green-600 text-[13px] font-bold mt-0.5">退回 75% (RM {(discountedPrice * 0.75).toFixed(2)})</span>
                          </div>
                        </div>

                        {/* 120 Days */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-gray-600 pl-7">120天内</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-gray-500 font-medium text-base">租凭费 RM {(discountedPrice * 0.30).toFixed(2)}</span>
                            <span className="text-gray-400 text-[13px] font-medium mt-0.5">退回 70% (RM {(discountedPrice * 0.7).toFixed(2)})</span>
                          </div>
                        </div>

                        {/* 150 Days */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-gray-600 pl-7">150天内</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-gray-500 font-medium text-base">租凭费 RM {(discountedPrice * 0.35).toFixed(2)}</span>
                            <span className="text-gray-400 text-[13px] font-medium mt-0.5">退回 65% (RM {(discountedPrice * 0.65).toFixed(2)})</span>
                          </div>
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
        {showPosterModal && posterImage && (
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
                ✕ CLOSE
              </button>
            </div>

            {/* Poster Image */}
            <div className="w-full max-w-[400px] md:max-w-[500px] flex flex-col relative flex-shrink-0 mb-4">
              <img src={posterImage} alt="Generated Poster" className="w-full h-auto rounded-xl shadow-2xl object-contain" />
              <p className="text-white/60 text-center mt-4 text-sm font-medium">Long press image to save and share!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Capture Area */}
      <PosterGenerator 
        games={filteredGames} 
        type="rental" 
        triggerId={generatingPosterDesign} 
        onGenerated={handlePosterGenerated}
        onError={handlePosterError}
      />

      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-[#FFFFFF] flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-[#E60012] rounded-full flex items-center justify-center shadow-lg animate-bounce mb-4">
            <img 
              src="/images/logo.png" 
              alt="Loading" 
              className="h-6 w-auto brightness-0 invert" 
              onError={(e) => e.currentTarget.style.display = 'none'} 
              referrerPolicy="no-referrer" 
            />
          </div>
          <p className="text-xl font-black tracking-widest text-gray-800 animate-pulse uppercase">
            Generating Poster...
          </p>
        </div>
      )}
    </div>
  );
}
