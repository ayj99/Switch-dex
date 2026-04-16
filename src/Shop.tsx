import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  ArrowLeft, 
  Users, 
  Globe, 
  Tag, 
  ThumbsUp, 
  MessageCircle, 
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Game, PHONE_NUMBER } from './types';

export default function Shop({ onBackToPortal }: { onBackToPortal: () => void }) {
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
          <img src="/images/logo.png" alt="Loading" className="h-6 w-auto brightness-0 invert" onError={(e) => e.currentTarget.style.display = 'none'} referrerPolicy="no-referrer" />
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
            <HomeView games={games} onGameClick={handleGameClick} onBackToPortal={onBackToPortal} />
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
function HomeView({ games, onGameClick, onBackToPortal }: { games: Game[], onGameClick: (g: Game) => void, onBackToPortal: () => void }) {
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [posterPage, setPosterPage] = useState(0);
  const [posterType, setPosterType] = useState<'featured' | 'category'>('category');

  // 1. Dynamic Categories
  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    games.forEach(g => {
      if (g.category) {
        g.category.split(',').forEach(c => cats.add(c.trim()));
      }
    });
    return ['All', ...Array.from(cats)];
  }, [games]);

  // 2. Filter & Search Logic
  const filteredGames = useMemo(() => {
    return games.filter(g => {
      const matchesFilter = filter === 'All' || (g.category && g.category.includes(filter));
      const matchesSearch = !searchQuery || g.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    }).sort((a, b) => {
      const getDiscountRate = (g: Game) => {
        if (g.originalPrice && g.price && g.originalPrice > g.price) {
          return (g.originalPrice - g.price) / g.originalPrice;
        }
        return 0;
      };
      const rateA = getDiscountRate(a);
      const rateB = getDiscountRate(b);
      
      if (rateA !== rateB) {
        return rateB - rateA;
      }
      return (b.votes || 0) - (a.votes || 0);
    });
  }, [games, filter, searchQuery]);

  // 3. Featured Deals Logic (isSale === true)
  const featuredGames = useMemo(() => {
    return games.filter(g => g.isSale === true);
  }, [games]);

  // 4. Poster Modal Logic
  const handleCategoryExport = () => {
    setPosterType('category');
    setPosterPage(0);
    setShowPosterModal(true);
  };

  const handleFeaturedExport = () => {
    setPosterType('featured');
    setPosterPage(0);
    setShowPosterModal(true);
  };

  // Determine which games to show in the poster
  const posterGames = useMemo(() => {
    let sourceGames = [];
    if (posterType === 'featured') {
      // Prioritize sale items, then fill with top voted to get 12
      const saleGames = [...games].filter(g => g.originalPrice && g.originalPrice > g.price).sort((a, b) => (b.votes || 0) - (a.votes || 0));
      const otherGames = [...games].filter(g => !(g.originalPrice && g.originalPrice > g.price)).sort((a, b) => (b.votes || 0) - (a.votes || 0));
      sourceGames = [...saleGames, ...otherGames].slice(0, 12);
    } else {
      sourceGames = filteredGames;
    }
    
    const startIndex = posterPage * 12;
    return sourceGames.slice(startIndex, startIndex + 12);
  }, [games, filteredGames, posterType, posterPage]);

  const totalPosterPages = Math.ceil((posterType === 'featured' ? 12 : filteredGames.length) / 12);

  return (
    <>
      {/* 1. Top Nav Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button 
          onClick={onBackToPortal}
          className="flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-black transition-colors w-32"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back 返回大厅</span>
        </button>
        
        <div className="flex items-center justify-center gap-2 flex-1">
          <img src="/images/logo.png" className="w-9 h-9 rounded-full object-cover border-2 border-[#e60012]" alt="Logo" referrerPolicy="no-referrer" onError={(e) => {
            e.currentTarget.style.display = 'none';
          }} />
          <div className="flex flex-col">
            <span className="text-2xl font-black italic tracking-tighter text-gray-900 leading-none">
              S<span className="text-[#e60012]">✘</span>ítčh Dé<span className="text-[#e60012]">✘</span>
            </span>
            <span className="text-gray-500 text-[10px] font-bold tracking-widest mt-0.5">
              诗和远方与Switch奇妙
            </span>
          </div>
        </div>

        <div className="w-24"></div> {/* Spacer for centering */}
      </header>

      {/* 2. Video Hero (Bilingual Text) */}
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
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 pointer-events-none px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-3 drop-shadow-lg uppercase">
            PLAY ANYTIME, ANYWHERE
          </h2>
          <p className="text-sm sm:text-base font-bold tracking-widest drop-shadow-md bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
            生活不只有詩和遠方 還有眼前的游戏
          </p>
        </div>
      </section>

      {/* 3. Featured Deals */}
      <section className="pt-6 pb-2 bg-white">
        <div className="px-4 mb-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-[#E60012] rounded-full"></div>
            <h2 className="text-lg font-black italic text-black tracking-tight">🌟 Featured Deals (特价精选)</h2>
            <span className="text-red-500 font-mono text-sm bg-red-50 px-2 py-1 rounded animate-pulse ml-2">Ends in 03:45:12</span>
          </div>
          <button 
            onClick={handleFeaturedExport}
            className="text-[10px] font-bold bg-[#E60012] text-white px-2 py-1 rounded shadow-sm hover:bg-red-700 transition-colors"
          >
            [ GENERATE FEATURED POSTER ]
          </button>
        </div>
        
        <div className="px-4 flex overflow-x-auto gap-4 no-scrollbar snap-x pb-4">
          {featuredGames.map((game) => (
            <motion.div 
              key={`sale-${game.id}`}
              whileTap={{ scale: 0.95 }}
              onClick={() => onGameClick(game)}
              className="bg-[#F8F9FA] rounded-xl overflow-hidden shadow-sm border border-gray-200 cursor-pointer relative flex flex-col flex-shrink-0 w-40 snap-start"
            >
              {/* Dynamic Badge */}
              <div className="absolute top-2 left-0 bg-[#E60012] text-[#FFD700] text-[10px] font-black px-2 py-1 rounded-r-md z-10 shadow-md flex items-center gap-1">
                ⚡ FLASH SALE
              </div>
              
              {/* Condition Tag (Top Right) */}
              <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm">
                {game.condition}
              </div>
              
              <div className="aspect-[3/4] w-full bg-gray-200">
                <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" loading="lazy" referrerPolicy="no-referrer" />
              </div>
              <div className="p-3 flex flex-col flex-grow">
                <h3 className="text-xs font-bold line-clamp-2 h-8 leading-tight mb-1">{game.title}</h3>
                <div className="mt-auto">
                  <div className="flex items-baseline gap-1.5">
                    <p className="text-[#E60012] font-black text-base leading-none">RM {game.price}</p>
                    {game.originalPrice && (
                      <p className="text-gray-400 text-[10px] line-through font-bold">RM {game.originalPrice}</p>
                    )}
                  </div>
                  {/* Players, Language, Votes */}
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500 font-medium flex-wrap">
                    <span className="flex items-center gap-0.5"><Users size={10} /> {game.players}</span>
                    <span className="flex items-center gap-0.5"><Globe size={10} /> {game.language}</span>
                    <span className="flex items-center gap-0.5 text-[#E60012]"><ThumbsUp size={10} /> {game.votes}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Main Grid with Search & Sticky Filters */}
      <section className="bg-white">
        <div className="sticky top-[52px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="px-4 pt-4 pb-1">
            <h2 className="text-lg font-black italic text-black tracking-tight">
              🎮 All Games (全部游戏)
            </h2>
          </div>
          {/* Search Bar */}
          <div className="px-4 pt-2 pb-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search games..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 text-sm rounded-full py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-[#E60012]/20 transition-all"
              />
            </div>
          </div>
          {/* Dynamic Tabs */}
          <div className="py-2 px-4 flex gap-2 overflow-x-auto no-scrollbar">
            {allCategories.map((f) => (
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
        </div>

        {/* Grid */}
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {filteredGames.length === 0 ? (
            <div className="col-span-2 py-10 text-center text-gray-400 font-bold">
              No games found.
            </div>
          ) : (
            filteredGames.map((game) => {
              const categoryTags = game.category ? game.category.split(',').map(c => c.trim()) : [];
              
              return (
                <motion.div 
                  key={game.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onGameClick(game)}
                  className="bg-[#F8F9FA] rounded-xl overflow-hidden border border-gray-200 shadow-sm flex flex-col cursor-pointer relative"
                >
                  {/* Condition Tag (Top Right) */}
                  <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2 py-1 rounded-md z-10 shadow-sm">
                    {game.condition}
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
                        <p className="text-[#E60012] font-black text-lg leading-none">
                          RM {game.price}
                        </p>
                        {game.originalPrice && (
                          <p className="text-gray-400 text-[10px] line-through font-bold">RM {game.originalPrice}</p>
                        )}
                      </div>
                      
                      {/* Players, Language, Votes */}
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium flex-wrap">
                        <span className="flex items-center gap-0.5"><Users size={10} /> {game.players}</span>
                        <span className="flex items-center gap-0.5 truncate"><Globe size={10} /> {game.language}</span>
                        <span className="flex items-center gap-0.5 text-[#E60012]"><ThumbsUp size={10} /> {game.votes}</span>
                      </div>

                      {/* Category Tags */}
                      <div className="flex flex-wrap gap-1 mt-1">
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
            })
          )}
        </div>
      </section>

      {/* Admin Export Footer */}
      <footer className="mt-4 py-8 flex justify-center border-t border-gray-100 bg-gray-50">
        {filter === 'All' ? (
          <button 
            disabled
            className="text-xs font-mono text-gray-400 bg-gray-200 cursor-not-allowed px-4 py-2 rounded"
          >
            [ 请先选择上方分类以生成海报 ]
          </button>
        ) : (
          <button 
            onClick={handleCategoryExport}
            className="text-xs font-mono text-gray-400 hover:text-gray-600 transition-colors px-4 py-2"
          >
            [ System Dump: XHS Grid ]
          </button>
        )}
      </footer>

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
                      诗和远方与Switch奇妙
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-xl md:text-3xl text-[#e60012] tracking-tighter uppercase drop-shadow-sm">
                    {posterType === 'featured' ? '限时特惠 / FEATURED DEALS' : `${filter} 系列精选`}
                  </p>
                </div>
              </div>

              {/* Red Content Area */}
              <div className="p-5 md:p-8 relative flex-grow flex flex-col">
                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none mix-blend-overlay"></div>

                {/* Grid Container (Flexbox with wrap and center) */}
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
                      
                      <div className="mt-auto flex items-baseline">
                        <p className="text-xs md:text-lg font-black text-[#E60012] leading-none">RM {game.price}</p>
                        {game.originalPrice && game.originalPrice > game.price && (
                          <span className="text-gray-400 text-[8px] md:text-xs line-through ml-1 font-bold">RM {game.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Footer Logo/Watermark */}
                <div className="mt-auto pt-6 text-center relative z-10">
                  <p className="text-white/80 font-mono text-[8px] md:text-xs tracking-widest uppercase">
                    Screenshot to share • Generated by S✘ítčh Dé✘ Studio
                  </p>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPosterPages > 1 && (
              <div className="w-full max-w-[800px] flex justify-center gap-4 mb-10 flex-shrink-0">
                <button 
                  onClick={() => setPosterPage(p => Math.max(0, p - 1))}
                  disabled={posterPage === 0}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-full backdrop-blur-md disabled:opacity-30 transition-all"
                >
                  [ Previous Page ]
                </button>
                <span className="text-white/60 font-mono flex items-center">
                  Page {posterPage + 1} of {totalPosterPages}
                </span>
                <button 
                  onClick={() => setPosterPage(p => Math.min(totalPosterPages - 1, p + 1))}
                  disabled={posterPage === totalPosterPages - 1}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-6 rounded-full backdrop-blur-md disabled:opacity-30 transition-all"
                >
                  [ Next Page ]
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ==========================================
// VIEW 2: DETAIL VIEW
// ==========================================
function DetailView({ game, games, onBack, onGameClick }: { game: Game, games: Game[], onBack: () => void, onGameClick: (g: Game) => void }) {
  const [likes, setLikes] = useState(game.votes || 0);
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const categoryTags = game.category ? game.category.split(',').map(c => c.trim()) : [];
  const isOutOfStock = game.status === '缺货';

  const handleWhatsAppClick = () => {
    const message = isOutOfStock 
      ? `hi, i would like to reserve ${game.title}, RM ${game.price}`
      : `hi, i'm interested with ${game.title}, RM ${game.price}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  return (
    <>
      {/* Top: Video Hero (16:9) */}
      <section className="relative aspect-video w-full overflow-hidden bg-black">
        {/* Out of Stock Mask */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-[#E60012]/60 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="bg-white/95 px-6 py-2 rounded-xl shadow-2xl transform -rotate-12 border-4 border-[#E60012]">
              <span className="text-2xl font-black text-[#E60012] tracking-widest uppercase">SOLD OUT / 已预订</span>
            </div>
          </div>
        )}

        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="h-full w-full object-cover opacity-80"
          poster={game.imageUrl}
          onError={(e) => {
            (e.target as HTMLVideoElement).style.display = 'none';
          }}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-playing-video-games-on-a-console-43034-large.mp4" type="video/mp4" />
        </video>
        
        {/* Fallback Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50" 
          style={{ backgroundImage: `url(${game.imageUrl})`, zIndex: -1 }}
        ></div>

        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 z-30 px-3 py-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-[#E60012] transition-colors flex items-center gap-1 text-sm font-bold"
        >
          <ArrowLeft size={18} />
          <span>Back 返回</span>
        </button>

        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
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
            <div className="px-2 py-1 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-md text-xs font-bold text-gray-700">
              Condition: {game.condition}
            </div>
            {categoryTags.map(cat => (
              <div key={cat} className="px-2 py-1 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-md text-xs font-bold text-[#E60012]">
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
            <span className="text-xs font-bold text-[#B91C1C]">{game.players}</span>
          </div>
          <div className="bg-[#FEE2E2] rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 border border-[#FECACA]">
            <Globe size={22} className="text-[#B91C1C]" />
            <span className="text-xs font-bold text-[#B91C1C] truncate w-full text-center">{game.language}</span>
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
              className="flex-shrink-0 w-32 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 snap-start cursor-pointer relative"
            >
              <div className="absolute top-1 right-1 bg-white/80 backdrop-blur-sm text-gray-800 text-[8px] font-bold px-1.5 py-0.5 rounded z-10 shadow-sm">
                {similarGame.condition}
              </div>
              <img 
                src={similarGame.imageUrl} 
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
          <button 
            onClick={handleWhatsAppClick}
            className="flex-[7] bg-[#E60012] text-white py-3 rounded-xl font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#E60012]/20 active:scale-95 transition-transform"
          >
            <MessageCircle size={22} fill="white" />
            {isOutOfStock ? '联系店长补货/预订' : 'WhatsApp 购买'}
          </button>
        </div>
      </footer>
    </>
  );
}
