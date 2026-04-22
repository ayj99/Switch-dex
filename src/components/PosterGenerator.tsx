import React, { useEffect } from 'react';
import html2canvas from 'html2canvas';

export interface PosterGeneratorProps {
  games: any[];
  type: 'rental' | 'shop';
  triggerId: number | null;
  onGenerated: (imgUrl: string) => void;
  onError?: (err: any) => void;
}

export default function PosterGenerator({ games, type, triggerId, onGenerated, onError }: PosterGeneratorProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (triggerId !== null) {
      // Small timeout to ensure DOM is fully painted and images are loaded
      const timer = setTimeout(async () => {
        if (containerRef.current) {
          try {
            const canvas = await html2canvas(containerRef.current, {
              scale: 2,
              useCORS: true,
              backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png');
            onGenerated(imgData);
          } catch (err) {
            console.error('Failed to generate poster:', err);
            if (onError) onError(err);
          }
        }
      }, 600); // Wait 600ms for images and layout to settle
      return () => clearTimeout(timer);
    }
  }, [triggerId, games, type, onGenerated, onError]);

  if (triggerId === null) return null;

  const posterGames = games.slice(0, 12);
  const isRental = type === 'rental';
  const labelText = isRental ? 'RENT / 租' : 'BUY / 买';
  const unitText = isRental ? '/mo' : '';

  return (
    <div className="fixed top-0 left-[200vw] w-[800px] z-[-1] bg-white pointer-events-none">
      <div ref={containerRef} className="w-[800px] bg-white flex flex-col pt-[1px] pb-[1px]">
        {/* Template 0: Default Grid */}
        {triggerId === 0 && (
          <div className="bg-[#e60012] p-8 flex flex-col relative overflow-hidden">
            <div className="bg-white px-8 py-6 flex items-center justify-between relative z-20 border-b-4 border-gray-900 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <img src="/images/logo.png" className="w-14 h-14 rounded-full object-cover border-2 border-[#e60012]" alt="Logo" referrerPolicy="no-referrer" />
                <div className="flex flex-col">
                  <span className="text-4xl font-black italic tracking-tighter text-gray-900 leading-none">
                    S<span className="text-[#e60012]">✘</span>ítčh Dé<span className="text-[#e60012]">✘</span>
                  </span>
                  <span className="text-gray-500 text-sm font-bold tracking-widest mt-0.5">海量大作随心玩</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-3xl text-[#e60012] tracking-tighter uppercase drop-shadow-sm">
                  {isRental ? 'Classic Rentals' : 'Top Deals'}
                </p>
              </div>
            </div>
            <div className="p-8 relative flex-grow bg-gray-900 rounded-b-3xl">
              <div className="grid grid-cols-3 gap-6 relative z-10">
                {posterGames.slice(0, 9).map((game) => {
                  const price = isRental ? Math.floor(game.price * 0.07) : game.price;
                  return (
                    <div key={game.id} className="bg-white rounded-xl p-4 flex flex-col shadow-xl">
                      <img src={game.imageUrl} className="w-full aspect-[3/4] object-cover rounded-lg mb-3 shadow-sm" referrerPolicy="no-referrer" />
                      <h3 className="text-base font-black truncate text-gray-900 mb-1">{game.title}</h3>
                      <p className="text-[#25D366] font-black text-xl mt-auto">RM {price}{unitText}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Template 1: Magazine Style */}
        {triggerId === 1 && posterGames.length > 0 && (
          <div className="bg-white flex flex-col relative">
            <div className="pt-12 px-10 pb-6 flex justify-between items-end border-b-8 border-black">
              <h1 className="text-7xl font-black tracking-tighter uppercase leading-none">Top<br/>Picks</h1>
              <span className="text-2xl font-bold bg-black text-white px-4 py-2 align-bottom">Switch Dex</span>
            </div>
            <div className="p-10 flex gap-8 border-b-4 border-gray-200">
              <img src={posterGames[0].imageUrl} className="w-1/2 rounded-2xl shadow-2xl object-cover aspect-square" referrerPolicy="no-referrer" />
              <div className="w-1/2 flex flex-col justify-center">
                <div className="bg-red-600 text-white font-black px-3 py-1 rounded inline-block w-max mb-4">FEATURED</div>
                <h2 className="text-5xl font-black leading-tight mb-4">{posterGames[0].title}</h2>
                <p className="text-3xl font-bold text-gray-500">From RM {isRental ? Math.floor(posterGames[0].price * 0.07) : posterGames[0].price}{unitText}</p>
              </div>
            </div>
            <div className="p-10 grid grid-cols-2 gap-x-8 gap-y-12">
              {posterGames.slice(1, 7).map((game, i) => {
                const price = isRental ? Math.floor(game.price * 0.07) : game.price;
                return (
                  <div key={game.id} className="flex gap-4 items-center">
                    <span className="text-5xl font-black text-gray-200 w-12">{i+2}</span>
                    <img src={game.imageUrl} className="w-24 h-32 object-cover rounded shadow" referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold leading-tight mb-1 truncate">{game.title}</h3>
                      <p className="text-red-500 font-bold">RM {price} {unitText}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Template 2: Dark Neon */}
        {triggerId === 2 && (
          <div className="bg-[#0a0a0c] flex flex-col p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/30 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/30 blur-[100px] rounded-full"></div>
            <div className="flex justify-between items-center z-10 mb-16">
              <h1 className="text-5xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500">
                {isRental ? 'RENTAL DROP' : 'BUYER DROP'}
              </h1>
              <img src="/images/logo.png" className="w-16 h-16 rounded-full border-2 border-cyan-400" referrerPolicy="no-referrer" />
            </div>
            <div className="grid grid-cols-2 gap-8 z-10">
              {posterGames.slice(0, 4).map(game => {
                const price = isRental ? Math.floor(game.price * 0.07) : game.price;
                return (
                  <div key={game.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm">
                    <img src={game.imageUrl} className="w-full aspect-square object-cover rounded-2xl mb-6 shadow-[0_0_30px_rgba(34,211,238,0.2)]" referrerPolicy="no-referrer" />
                    <h3 className="text-2xl font-bold truncate mb-2">{game.title}</h3>
                    <div className="flex justify-between items-center mt-4">
                      <span className="bg-cyan-500/20 text-cyan-300 font-bold px-3 py-1 rounded-full text-sm uppercase">
                        {labelText} NOW
                      </span>
                      <span className="text-3xl font-black text-white">RM {price}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="w-full mt-10 text-center text-white/50 text-xl tracking-widest">SCREENSHOT TO SHARE</div>
          </div>
        )}
      </div>
    </div>
  );
}
