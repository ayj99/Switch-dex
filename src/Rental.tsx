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
                              RM {Math.floor(game.price * 0.083)} - {Math.floor(game.price * 0.15)} <span className="text-[10px] font-bold text-gray-500">/ 月</span>
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
            const min = Math.floor(selectedGame.price * 0.083);
            const max = Math.floor(selectedGame.price * 0.15);
            const mid = Math.floor(selectedGame.price * 0.125);
            
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
                      
                      <div className="space-y-3 mb-5">
                        <div className="flex items-center justify-between text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="w-28">📅 30 Days / 天</span>
                          <span className="text-gray-900 font-bold">Refund 退 85%</span>
                          <span className="w-40 text-right text-gray-500">(Avg Cost: RM {max}/mo)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="w-28">📅 60 Days / 天</span>
                          <span className="text-gray-900 font-bold">Refund 退 75%</span>
                          <span className="w-40 text-right text-gray-500">(Avg Cost: RM {mid}/mo)</span>
                        </div>
                        <div className="flex items-center justify-between text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                          <span className="w-28">📅 90 Days / 天</span>
                          <span className="text-gray-900 font-bold">Refund 退 70%</span>
                          <span className="w-40 text-right text-gray-500">(Avg Cost: RM {min}/mo)</span>
                        </div>
                      </div>

                      <div className="space-y-2 mt-6 pt-5 border-t border-gray-100">
                        <ul className="space-y-3 text-xs text-gray-500 font-normal">
                          <li className="flex items-start gap-2">
                            <span>1.</span>
                            <div className="flex flex-col gap-0.5">
                              <span>Deposit: Full game price + RM 5 activation fee upon order.</span>
                              <span>押金: 付原价作为押金 + RM5 开启服务费，下单时确认。</span>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>2.</span>
                            <div className="flex flex-col gap-0.5">
                              <span>Shipping: Buyer bears return shipping costs.</span>
                              <span>物流: 卡带需自行寄回，邮费由买家承担。</span>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>3.</span>
                            <div className="flex flex-col gap-0.5">
                              <span>Condition: Cartridge must be in good working condition. Penalties apply for damage.</span>
                              <span>卡况: 卡带必须完好、正常使用；如有损坏将视情况扣除。</span>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>4.</span>
                            <div className="flex flex-col gap-0.5">
                              <span>Timeframe: Refund rate depends on the postmark date of return.</span>
                              <span>时效: 退款金额取决于寄出时间。</span>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>5.</span>
                            <div className="flex flex-col gap-0.5">
                              <span>Refund: Choose Game Swap (Full rate) or Cash Refund. (Cash refund deducts an extra 5%).</span>
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
