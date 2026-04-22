import React, { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

export interface PosterGeneratorProps {
  games: any[];
  type: 'rental' | 'shop';
  triggerId: number | null;
  onGenerated: (imgUrl: string) => void;
  onError?: (err: any) => void;
}

export default function PosterGenerator({ games, type, triggerId, onGenerated, onError }: PosterGeneratorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Only run AFTER the template ID state has successfully updated the React DOM
    if (triggerId === null || !containerRef.current) return;

    let isCancelled = false;

    const capture = async () => {
      try {
        // 2. Force the DOM to strictly repaint before capture
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => setTimeout(resolve, 50)); // Small buffer for CSS variables/fonts to apply

        if (isCancelled || !containerRef.current) return;

        // 3. Guarantee all images within the new template are fully resolved before capture
        const images = Array.from(containerRef.current.querySelectorAll('img'));
        await Promise.all(
          images.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              const timeout = setTimeout(resolve, 3000); // 3s max wait per image
              img.onload = () => { clearTimeout(timeout); resolve(null); };
              img.onerror = () => { clearTimeout(timeout); resolve(null); }; // Resolve anyway to avoid infinite hang on broken/cors images
            });
          })
        );

        if (isCancelled || !containerRef.current) return;

        // 4. Capture with backgroundColor: null to preserve Tailwind backgrounds (Gradients/Neon)
        const canvas = await html2canvas(containerRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: null, // CRITICAL FIX for Dark Mode / Gradients overriding
          logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        if (!isCancelled) onGenerated(imgData);

      } catch (err) {
        console.error('Failed to generate poster:', err);
        if (!isCancelled && onError) onError(err);
      }
    };

    capture();

    return () => {
      isCancelled = true;
    };
  }, [triggerId, games, type, onGenerated, onError]);

  // Completely wipe from DOM if not active
  if (triggerId === null) return null;

  const posterGames = games.slice(0, 12);
  const isRental = type === 'rental';
  const labelText = isRental ? 'RENT' : 'BUY';
  const unitText = isRental ? '/mo' : '';

  return (
    <div className="fixed top-0 left-[200vw] w-[800px] z-[-1] pointer-events-none">
      <div ref={containerRef} className="w-[800px] flex flex-col">
        
        {/* Template 0: Classic (Clean, White, Gray Borders) */}
        {triggerId === 0 && (
          <div className="bg-white p-10 flex flex-col w-full text-gray-900 border-[16px] border-gray-100 min-h-[800px]">
            <div className="flex items-center justify-between border-b-2 border-gray-200 pb-6 mb-8">
              <div className="flex items-center gap-4">
                <img src="/images/logo.png" className="w-16 h-16 rounded-full border border-gray-300" alt="Logo" />
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-gray-900 leading-none">Switch Dex</h1>
                  <p className="text-gray-500 font-medium tracking-widest uppercase text-sm mt-1">Official Collection</p>
                </div>
              </div>
              <div className="bg-gray-900 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm shadow-md">
                {labelText} SELECTION
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 flex-grow">
              {posterGames.slice(0, 9).map((game) => {
                const price = isRental ? Math.floor(game.price * 0.07) : game.price;
                return (
                  <div key={game.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col shadow-sm">
                    <img src={game.imageUrl} className="w-full aspect-[3/4] object-cover rounded-lg mb-4 border border-gray-100" crossOrigin={game.imageUrl?.startsWith('http') ? "anonymous" : undefined} referrerPolicy="no-referrer" />
                    <h3 className="text-lg font-bold truncate text-gray-900 mb-2">{game.title}</h3>
                    <p className="text-gray-900 font-black text-2xl mt-auto">RM {price}<span className="text-sm font-normal text-gray-500">{unitText}</span></p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Template 1: Neon/Cyber (Dark Mode, Glowing Text, Neon Borders) */}
        {triggerId === 1 && posterGames.length > 0 && (
          <div className="bg-slate-900 p-10 flex flex-col w-full text-white border-4 border-cyan-800 relative overflow-hidden min-h-[800px]">
             {/* Neon Orbs Component */}
             <div className="absolute -top-20 -left-20 w-96 h-96 bg-cyan-600/30 blur-[100px] rounded-full pointer-events-none"></div>
             <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-600/30 blur-[100px] rounded-full pointer-events-none"></div>
             
             <div className="flex justify-between items-end mb-10 relative z-10 border-b border-cyan-900 pb-6">
                <div>
                  <h1 className="text-6xl font-black tracking-tighter uppercase text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                    CYBER<br/>{labelText}
                  </h1>
                </div>
                <img src="/images/logo.png" className="w-16 h-16 rounded-2xl border-2 border-cyan-500 shadow-[0_0_20px_rgba(34,211,238,0.4)]" alt="Logo" />
             </div>

             <div className="grid grid-cols-2 gap-6 relative z-10">
               {posterGames.slice(0, 6).map((game) => {
                 const price = isRental ? Math.floor(game.price * 0.07) : game.price;
                 return (
                   <div key={game.id} className="bg-slate-800/80 backdrop-blur border border-cyan-500/30 rounded-xl p-4 flex gap-4 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                     <img src={game.imageUrl} className="w-24 h-32 object-cover rounded shadow-md border border-cyan-900" crossOrigin={game.imageUrl?.startsWith('http') ? "anonymous" : undefined} referrerPolicy="no-referrer" />
                     <div className="flex flex-col justify-center flex-1 min-w-0">
                       <h3 className="text-lg font-bold leading-tight mb-2 truncate text-slate-100">{game.title}</h3>
                       <p className="text-cyan-400 font-black text-2xl drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                         <span className="text-sm text-cyan-700 mr-1">RM</span>{price}{unitText}
                       </p>
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}

        {/* Template 2: Vibrant/Gradient (Glassmorphism, Vivid Colors) */}
        {triggerId === 2 && (
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-12 flex flex-col w-full min-h-[800px] relative overflow-hidden">
            {/* Dynamic abstract shapes for gradient */}
            <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-orange-400/20 rounded-full blur-3xl"></div>

            <div className="flex justify-between items-center z-10 mb-12">
              <div className="flex items-center gap-4">
                <img src="/images/logo.png" className="w-16 h-16 rounded-3xl border-2 border-white/50 shadow-xl bg-white" alt="Logo" />
                <h1 className="text-5xl font-black tracking-tight text-white drop-shadow-md">
                  Trending<br/>Now
                </h1>
              </div>
              <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-2xl font-black text-xl tracking-widest shadow-xl">
                {labelText}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 z-10 flex-grow">
              {posterGames.slice(0, 4).map(game => {
                const price = isRental ? Math.floor(game.price * 0.07) : game.price;
                return (
                  <div key={game.id} className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-6 flex flex-col shadow-2xl">
                    <img src={game.imageUrl} className="w-full aspect-[4/3] object-cover rounded-2xl mb-6 shadow-inner" crossOrigin={game.imageUrl?.startsWith('http') ? "anonymous" : undefined} referrerPolicy="no-referrer" />
                    <h3 className="text-2xl font-bold truncate mb-2 text-white drop-shadow-md">{game.title}</h3>
                    <div className="flex justify-between items-center mt-auto pt-4">
                      <span className="text-white/80 font-bold uppercase tracking-widest text-sm">
                        RM
                      </span>
                      <span className="text-4xl font-black text-white drop-shadow-lg">{price}{unitText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="w-full mt-10 text-center text-white/70 text-sm tracking-[0.3em] font-medium uppercase z-10">
              Generated by Switch Dex Studio
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
