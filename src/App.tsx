/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ArrowLeft, 
  Users, 
  Globe, 
  Tag, 
  ThumbsUp, 
  MessageCircle, 
  Play,
  Gamepad2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types & Data ---
type Condition = 'New' | 'Used' | 'Both';
type BadgeType = 'SALE' | 'NEW ITEM' | 'HOT SELLING';

interface Game {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  isSale?: boolean;
  badge?: BadgeType;
  condition: Condition;
  coverUrl: string;
  players: string;
  languages: string;
  genre: string;
  description: string;
  category: string; // Now a comma-separated string, e.g. "亲子游戏, IP游戏, 必玩神作"
}

const CONDITION_LABELS = {
  'New': '全新',
  'Used': '二手',
  'Both': '全新/二手'
};

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'detail'>('home');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Fetch data from static JSON
  useEffect(() => {
    fetch('/games.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load games data');
        return res.json();
      })
      .then(data => {
        setGames(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  // Load html2canvas dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
    setCurrentView('detail');
  };

  const handleBack = () => {
    setCurrentView('home');
    setTimeout(() => setSelectedGame(null), 300); // Clear after animation
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-[#E60012] rounded-full flex items-center justify-center shadow-lg animate-bounce mb-4">
          <Gamepad2 size={28} className="text-white" />
        </div>
        <p className="text-xl font-black tracking-widest text-gray-800 animate-pulse">
          Loading Dex...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans text-gray-900 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {currentView === 'home' ? (
          <motion.div 
            key="home-view"
            id="home-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="pb-20"
          >
            <HomeView games={games} onGameClick={handleGameClick} />
          </motion.div>
        ) : (
          <motion.div 
            key="detail-view"
            id="detail-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="pb-24 bg-[#FFFFFF] min-h-screen"
          >
            {selectedGame && <DetailView game={selectedGame} games={games} onBack={handleBack} onGameClick={handleGameClick} />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Styles for hiding scrollbars */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 1rem); }
      `}</style>
    </div>
  );
}

// ==========================================
// VIEW 1: HOME
// ==========================================
function HomeView({ games, onGameClick }: { games: Game[], onGameClick: (g: Game) => void }) {
  const [filter, setFilter] = useState<string>('All');
  const [exportChunks, setExportChunks] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // CRITICAL: Filter using .includes() on the category string
  const filteredGames = filter === 'All' 
    ? games 
    : games.filter(g => g.category && g.category.includes(filter));

  const saleGames = games.filter(g => g.isSale);

  const handleAdminExport = () => {
    // Group current displayed games by category
    const categoriesToExport = ['双人游戏', '派对游戏', '亲子游戏'];
    const chunks: any[] = [];
    
    categoriesToExport.forEach(cat => {
      // CRITICAL: Filter using .includes()
      const gamesInCat = filteredGames.filter(g => g.category && g.category.includes(cat));
      if (gamesInCat.length > 0) {
        // Split into chunks of 12
        for (let i = 0; i < gamesInCat.length; i += 12) {
          chunks.push({
            category: cat,
            games: gamesInCat.slice(i, i + 12),
            chunkIndex: Math.floor(i / 12) + 1
          });
        }
      }
    });
    
    if (chunks.length === 0) {
      alert("当前列表没有可导出的分类游戏！");
      return;
    }
    
    setExportChunks(chunks);
    setIsExporting(true);
  };

  // Effect to handle the actual canvas generation once DOM is ready
  useEffect(() => {
    if (isExporting && exportChunks.length > 0) {
      const generatePosters = async () => {
        const html2canvas = (window as any).html2canvas;
        if (!html2canvas) {
          alert("海报生成库加载中，请稍后再试...");
          setIsExporting(false);
          return;
        }
        
        // Wait for DOM to render the hidden templates and images to load
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        for (let i = 0; i < exportChunks.length; i++) {
          const el = document.getElementById(`xhs-poster-${i}`);
          if (el) {
            try {
              const canvas = await html2canvas(el, { 
                useCORS: true, 
                scale: 2, // High resolution
                backgroundColor: '#F4F4F6'
              });
              const url = canvas.toDataURL('image/png');
              const a = document.createElement('a');
              a.href = url;
              
              // Map category to English for filename
              const catMap: Record<string, string> = {
                '双人游戏': 'couples',
                '派对游戏': 'party',
                '亲子游戏': 'family'
              };
              const catEn = catMap[exportChunks[i].category] || 'misc';
              
              a.download = `xhs_poster_${catEn}_${exportChunks[i].chunkIndex}.png`;
              a.click();
            } catch (err) {
              console.error("Failed to generate poster", err);
            }
          }
        }
        
        alert('🎉 小红书海报已生成完毕，请查收相册！');
        setIsExporting(false);
        setExportChunks([]);
      };
      
      generatePosters();
    }
  }, [isExporting, exportChunks]);

  return (
    <>
      {/* 1. Top Nav Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-center">
        <div className="flex items-center gap-2">
          {/* Circular Logo */}
          <div className="w-8 h-8 bg-[#E60012] rounded-full flex items-center justify-center shadow-sm">
            <Gamepad2 size={18} className="text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-black">
            S<span className="text-[#E60012]">✘</span>ítčh Dé<span className="text-[#E60012]">✘</span>
          </h1>
        </div>
      </header>

      {/* 2. Video Hero */}
      <section className="relative h-[35vh] w-full overflow-hidden bg-black">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="h-full w-full object-cover opacity-60"
          poster="https://picsum.photos/seed/nintendo-hero/1920/1080"
          onError={(e) => {
            (e.target as HTMLVideoElement).style.display = 'none';
          }}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-playing-video-games-on-a-console-43034-large.mp4" type="video/mp4" />
        </video>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40" 
          style={{ backgroundImage: 'url(https://picsum.photos/seed/nintendo-hero/1920/1080)', zIndex: -1 }}
        ></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 pointer-events-none">
          <h2 className="text-4xl font-black tracking-tighter mb-2 drop-shadow-lg">
            S<span className="text-[#E60012]">✘</span>ítčh Dé<span className="text-[#E60012]">✘</span>
          </h2>
          <p className="text-sm font-bold tracking-widest uppercase drop-shadow-md bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
            Play Anytime, Anywhere
          </p>
        </div>
      </section>

      {/* 3. Featured Deals Carousel */}
      <section className="pt-6 pb-2 bg-white">
        <div className="px-4 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-[#E60012] rounded-full"></div>
            <h2 className="text-lg font-black italic text-black tracking-tight">FEATURED DEALS</h2>
          </div>
          {/* View All Button */}
          <button className="text-xs font-bold text-gray-500 hover:text-[#E60012] transition-colors">
            View All
          </button>
        </div>
        
        <div className="flex overflow-x-auto gap-4 px-4 no-scrollbar pb-4 snap-x">
          {saleGames.map((game) => (
            <motion.div 
              key={`sale-${game.id}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => onGameClick(game)}
              className="flex-shrink-0 w-40 bg-[#F8F9FA] rounded-xl overflow-hidden shadow-sm border border-gray-200 snap-start cursor-pointer relative"
            >
              {/* Dynamic Badge */}
              {game.badge && (
                <div className="absolute top-2 left-0 bg-[#E60012] text-white text-[10px] font-black px-2 py-1 rounded-r-md z-10 shadow-md">
                  {game.badge}
                </div>
              )}
              
              <div className="aspect-[3/4] w-full bg-gray-200">
                <img src={game.coverUrl} alt={game.title} className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
              </div>
              <div className="p-3">
                <h3 className="text-xs font-bold line-clamp-1 mb-1">{game.title}</h3>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-[#E60012] font-black text-base leading-none">RM {game.price}</p>
                  {game.originalPrice && (
                    <p className="text-gray-400 text-[10px] line-through font-bold">RM {game.originalPrice}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Main Grid with Sticky Filters & Search */}
      <section className="bg-white">
        {/* Sticky Filters & Search */}
        <div className="sticky top-[52px] z-40 bg-white/95 backdrop-blur-md py-3 px-4 flex items-center justify-between border-b border-gray-100 shadow-sm gap-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar flex-grow">
            {(['All', '双人游戏', '派对游戏', '亲子游戏']).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                  filter === f 
                    ? 'bg-[#E60012] text-white shadow-md shadow-red-500/20' 
                    : 'bg-[#F8F9FA] text-gray-600 border border-gray-200 hover:border-[#E60012]/50'
                }`}
              >
                {f === 'All' ? '全部 (All)' : f}
              </button>
            ))}
          </div>
          <button className="p-2 text-gray-600 hover:text-[#E60012] transition-colors bg-gray-100 rounded-full flex-shrink-0">
            <Search size={18} />
          </button>
        </div>

        {/* Grid */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {filteredGames.map((game) => {
            // Split the category string into an array for rendering tags
            const categoryTags = game.category ? game.category.split(',').map(c => c.trim()) : [];
            
            return (
              <motion.div 
                key={game.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => onGameClick(game)}
                className="bg-[#F8F9FA] rounded-xl overflow-hidden border border-gray-200 shadow-sm flex flex-col cursor-pointer"
              >
                <div className="relative aspect-[3/4] w-full bg-gray-200">
                  <img 
                    src={game.coverUrl} 
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
                      <p className="text-[#E60012] font-black text-lg leading-none">
                        RM {game.price}
                      </p>
                      {game.originalPrice && (
                        <p className="text-gray-400 text-[10px] line-through font-bold">RM {game.originalPrice}</p>
                      )}
                    </div>
                    
                    {/* Category Tags */}
                    <div className="flex flex-wrap gap-1">
                      {categoryTags.slice(0, 2).map(cat => (
                        <span key={cat} className="inline-block px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-bold text-gray-600">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Admin Export Footer */}
      <footer className="mt-4 py-8 flex justify-center border-t border-gray-100 bg-gray-50">
        <button 
          onClick={handleAdminExport}
          disabled={isExporting}
          className="text-xs font-mono text-gray-400 hover:text-gray-600 transition-colors px-4 py-2 disabled:opacity-50"
        >
          {isExporting ? '[ Generating Posters... ]' : '[ System Dump: XHS Grid ]'}
        </button>
      </footer>

      {/* Hidden XHS Poster Templates */}
      {exportChunks.length > 0 && (
        <div className="fixed top-[-9999px] left-[-9999px] opacity-0 pointer-events-none z-[-1]">
          {exportChunks.map((chunk, idx) => (
            <div 
              key={idx} 
              id={`xhs-poster-${idx}`} 
              className="w-[900px] h-[1200px] bg-[#F4F4F6] flex flex-col p-10 box-border"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#E60012] rounded-full flex items-center justify-center">
                    <Gamepad2 size={28} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-black tracking-tighter text-black">
                    S<span className="text-[#E60012]">✘</span>ítčh Dé<span className="text-[#E60012]">✘</span>
                  </h1>
                </div>
                <h2 className="text-4xl font-black text-gray-800 tracking-tight">
                  S<span className="text-[#E60012]">✘</span>ítčh Dé<span className="text-[#E60012]">✘</span> 精选：{chunk.category}
                </h2>
              </div>
              
              {/* Grid 3x4 */}
              <div className="grid grid-cols-3 grid-rows-4 gap-6 flex-grow">
                {chunk.games.map((game: Game) => (
                  <div key={game.id} className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 flex flex-col shadow-sm border border-white relative">
                    {/* Condition Tag */}
                    <div className="absolute top-4 right-4 bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg z-10 shadow-sm">
                      {CONDITION_LABELS[game.condition]}
                    </div>
                    
                    <img 
                      src={game.coverUrl} 
                      alt={game.title} 
                      className="w-full aspect-[3/4] object-cover rounded-2xl mb-4 shadow-sm" 
                      crossOrigin="anonymous" 
                      referrerPolicy="no-referrer"
                    />
                    
                    <h3 className="text-xl font-bold line-clamp-2 leading-tight text-gray-900 mb-2">
                      {game.title}
                    </h3>
                    
                    <div className="mt-auto flex items-end justify-between">
                      <div className="flex flex-col">
                        {game.originalPrice && (
                          <span className="text-gray-400 text-sm line-through font-bold mb-0.5">RM {game.originalPrice}</span>
                        )}
                        <p className="text-3xl font-black text-[#B91C1C] leading-none">RM {game.price}</p>
                      </div>
                      <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                        <MessageCircle size={24} className="text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ==========================================
// VIEW 2: DETAIL VIEW
// ==========================================
function DetailView({ game, games, onBack, onGameClick }: { game: Game, games: Game[], onBack: () => void, onGameClick: (g: Game) => void }) {
  const [likes, setLikes] = useState(256);
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  // Split the category string into an array for rendering tags
  const categoryTags = game.category ? game.category.split(',').map(c => c.trim()) : [];

  return (
    <>
      {/* Top: Video Hero (16:9) */}
      <section className="relative aspect-video w-full overflow-hidden bg-black">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="h-full w-full object-cover opacity-80"
          poster={game.coverUrl}
          onError={(e) => {
            (e.target as HTMLVideoElement).style.display = 'none';
          }}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-playing-video-games-on-a-console-43034-large.mp4" type="video/mp4" />
        </video>
        
        {/* Fallback Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50" 
          style={{ backgroundImage: `url(${game.coverUrl})`, zIndex: -1 }}
        ></div>

        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 z-10 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-[#E60012] transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40">
            <Play className="text-white fill-white ml-1" size={28} />
          </div>
        </div>
      </section>

      {/* Core Info */}
      <section className="px-5 pt-6 pb-4 bg-white">
        <h1 className="text-2xl font-black tracking-tight text-black leading-tight">
          {game.title}
        </h1>
        
        <div className="flex flex-col gap-3 mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-[#E60012]">
              RM {game.price}
            </span>
            {game.originalPrice && (
              <span className="text-gray-400 text-lg line-through font-bold">
                RM {game.originalPrice}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="px-2 py-1 bg-[#F8F9FA] border border-gray-200 rounded text-xs font-bold text-gray-700">
              Condition: {CONDITION_LABELS[game.condition]}
            </div>
            {categoryTags.map(cat => (
              <div key={cat} className="px-2 py-1 bg-red-50 border border-red-100 rounded text-xs font-bold text-[#E60012]">
                {cat}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specs Row (Red Square Version) */}
      <section className="px-5 py-2 bg-white">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#FEE2E2] rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 border border-[#FECACA]">
            <Users size={22} className="text-[#B91C1C]" />
            <span className="text-xs font-bold text-[#B91C1C]">{game.players} 玩家</span>
          </div>
          <div className="bg-[#FEE2E2] rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 border border-[#FECACA]">
            <Globe size={22} className="text-[#B91C1C]" />
            <span className="text-xs font-bold text-[#B91C1C]">{game.languages}</span>
          </div>
          <div className="bg-[#FEE2E2] rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 border border-[#FECACA]">
            <Tag size={22} className="text-[#B91C1C]" />
            <span className="text-xs font-bold text-[#B91C1C] truncate w-full text-center">{game.genre}</span>
          </div>
        </div>
      </section>

      {/* Game Intro */}
      <section className="px-5 py-6 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-5 w-1.5 bg-[#E60012] rounded-full"></div>
          <h2 className="text-base font-black uppercase tracking-wide flex items-center gap-2">
            Game Intro <span className="text-gray-400 font-bold">/ 游戏详情</span>
          </h2>
        </div>
        <p className="text-gray-600 leading-relaxed text-sm">
          {game.description}
        </p>
      </section>

      {/* Similar Games Carousel */}
      <section className="py-6 bg-[#F8F9FA] border-t border-gray-100">
        <div className="px-5 mb-3 flex items-center gap-2">
          <div className="w-1.5 h-4 bg-gray-800 rounded-full"></div>
          <h2 className="text-sm font-black uppercase tracking-wide text-gray-800">
            You May Also Like
          </h2>
        </div>
        
        <div className="flex overflow-x-auto gap-3 px-5 no-scrollbar pb-2 snap-x">
          {games.filter(g => g.id !== game.id).slice(0, 4).map((similarGame) => (
            <div 
              key={similarGame.id}
              onClick={() => onGameClick(similarGame)}
              className="flex-shrink-0 w-32 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 snap-start cursor-pointer"
            >
              <img 
                src={similarGame.coverUrl} 
                alt={similarGame.title} 
                className="w-full aspect-[3/4] object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="p-2">
                <h3 className="text-[10px] font-bold line-clamp-2 h-7 leading-tight">{similarGame.title}</h3>
                <p className="text-[#E60012] font-black text-xs mt-1">RM {similarGame.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky Footer CTA */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-3 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto flex gap-3">
          {/* Sub Button (30%) */}
          <button 
            onClick={handleLike}
            className={`flex-[3] flex items-center justify-center gap-1.5 py-3 rounded-xl font-bold transition-all border-2 ${
              liked 
                ? 'bg-[#FEE2E2] text-[#B91C1C] border-[#B91C1C] scale-105' 
                : 'bg-[#F8F9FA] text-gray-600 border-gray-200 hover:border-[#E60012]/50 active:scale-95'
            }`}
          >
            <ThumbsUp size={18} className={liked ? 'fill-[#B91C1C]' : ''} />
            <span className="text-sm">顶 ({likes})</span>
          </button>

          {/* Main Button (70%) */}
          <button className="flex-[7] bg-[#E60012] text-white py-3 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#E60012]/20 active:scale-95 transition-transform">
            <MessageCircle size={22} fill="white" />
            WhatsApp 购买
          </button>
        </div>
      </footer>
    </>
  );
}
