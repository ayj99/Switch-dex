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

  // Helper to force external URLs through a CORS-enabled proxy
  const getSafeImageUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) {
      return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp`;
    }
    return url;
  };

  return (
    <div className="fixed top-0 left-0 w-[800px] z-[-50] opacity-0 pointer-events-none">
      <div ref={containerRef} className="w-[800px] flex flex-col">
        
        {/* Template 0: Classic (Clean, White, Gray Borders) */}
        {triggerId === 0 && (
          <div style={{ backgroundColor: '#ffffff', borderColor: '#f3f4f6', color: '#111827' }} className="p-10 flex flex-col w-full border-[16px] min-h-[800px]">
            <div style={{ borderColor: '#e5e7eb' }} className="flex items-center justify-between border-b-2 pb-6 mb-8">
              <div className="flex items-center gap-4">
                <img src="/images/logo.png" style={{ borderColor: '#d1d5db' }} className="w-16 h-16 rounded-full border" alt="Logo" />
                <div>
                  <h1 style={{ color: '#111827' }} className="text-4xl font-black tracking-tight leading-none">Switch Dex</h1>
                  <p style={{ color: '#6b7280' }} className="font-medium tracking-widest uppercase text-sm mt-1">Official Collection</p>
                </div>
              </div>
              <div style={{ backgroundColor: '#111827', color: '#ffffff' }} className="px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm shadow-md">
                {labelText} SELECTION
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 justify-between flex-grow">
              {posterGames.slice(0, 9).map((game) => {
                const price = isRental ? Math.floor(game.price * 0.07) : game.price;
                return (
                  <div key={game.id} style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', width: 'calc(33.333% - 16px)' }} className="border rounded-xl p-4 flex flex-col shadow-sm">
                    <img src={getSafeImageUrl(game.imageUrl)} style={{ borderColor: '#f3f4f6' }} className="w-full h-48 object-cover rounded-lg mb-4 border" crossOrigin={game.imageUrl?.startsWith('http') ? "anonymous" : undefined} referrerPolicy="no-referrer" />
                    <h3 style={{ color: '#111827' }} className="text-lg font-bold truncate mb-2">{game.title}</h3>
                    <p style={{ color: '#111827' }} className="font-black text-2xl mt-auto">RM {price}<span style={{ color: '#6b7280' }} className="text-sm font-normal">{unitText}</span></p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Template 1: Neon/Cyber (Dark Mode, Glowing Text, Neon Borders) */}
        {triggerId === 1 && posterGames.length > 0 && (
          <div style={{ backgroundColor: '#0f172a', borderColor: '#155e75', color: '#ffffff' }} className="p-10 flex flex-col w-full border-4 relative overflow-hidden min-h-[800px]">
             {/* Neon Orbs Component */}
             <div style={{ backgroundColor: 'rgba(8, 145, 178, 0.3)' }} className="absolute -top-20 -left-20 w-96 h-96 blur-[100px] rounded-full pointer-events-none"></div>
             <div style={{ backgroundColor: 'rgba(147, 51, 234, 0.3)' }} className="absolute -bottom-20 -right-20 w-96 h-96 blur-[100px] rounded-full pointer-events-none"></div>
             
             <div style={{ borderColor: '#164e63' }} className="flex justify-between items-end mb-10 relative z-10 border-b pb-6">
                <div>
                  <h1 style={{ color: '#22d3ee' }} className="text-6xl font-black tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                    CYBER<br/>{labelText}
                  </h1>
                </div>
                <img src="/images/logo.png" style={{ borderColor: '#06b6d4' }} className="w-16 h-16 rounded-2xl border-2 shadow-[0_0_20px_rgba(34,211,238,0.4)]" alt="Logo" />
             </div>

             <div className="flex flex-wrap gap-6 justify-between relative z-10">
               {posterGames.slice(0, 6).map((game) => {
                 const price = isRental ? Math.floor(game.price * 0.07) : game.price;
                 return (
                   <div key={game.id} style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', borderColor: 'rgba(6, 182, 212, 0.3)', width: 'calc(50% - 12px)' }} className="backdrop-blur border rounded-xl p-4 flex gap-4 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                     <img src={getSafeImageUrl(game.imageUrl)} style={{ borderColor: '#164e63' }} className="w-24 h-32 object-cover rounded shadow-md border" crossOrigin={game.imageUrl?.startsWith('http') ? "anonymous" : undefined} referrerPolicy="no-referrer" />
                     <div className="flex flex-col justify-center flex-1 min-w-0">
                       <h3 style={{ color: '#f1f5f9' }} className="text-lg font-bold leading-tight mb-2 truncate">{game.title}</h3>
                       <p style={{ color: '#22d3ee' }} className="font-black text-2xl drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                         <span style={{ color: '#0e7490' }} className="text-sm mr-1">RM</span>{price}{unitText}
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
          <div style={{ background: 'linear-gradient(to bottom right, #6366f1, #a855f7, #ec4899)' }} className="p-12 flex flex-col w-full min-h-[800px] relative overflow-hidden">
            {/* Dynamic abstract shapes for gradient */}
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} className="absolute top-10 right-10 w-64 h-64 rounded-full blur-3xl"></div>
            <div style={{ backgroundColor: 'rgba(251, 146, 60, 0.2)' }} className="absolute bottom-10 left-10 w-80 h-80 rounded-full blur-3xl"></div>

            <div className="flex justify-between items-center z-10 mb-12">
              <div className="flex items-center gap-4">
                <img src="/images/logo.png" style={{ borderColor: 'rgba(255, 255, 255, 0.5)', backgroundColor: '#ffffff' }} className="w-16 h-16 rounded-3xl border-2 shadow-xl" alt="Logo" />
                <h1 style={{ color: '#ffffff' }} className="text-5xl font-black tracking-tight drop-shadow-md">
                  Trending<br/>Now
                </h1>
              </div>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)', color: '#ffffff' }} className="backdrop-blur-md border px-6 py-3 rounded-2xl font-black text-xl tracking-widest shadow-xl">
                {labelText}
              </div>
            </div>

            <div className="flex flex-wrap gap-8 justify-between z-10 flex-grow">
              {posterGames.slice(0, 4).map(game => {
                const price = isRental ? Math.floor(game.price * 0.07) : game.price;
                return (
                  <div key={game.id} style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)', width: 'calc(50% - 16px)' }} className="backdrop-blur-md border rounded-3xl p-6 flex flex-col shadow-2xl">
                    <img src={getSafeImageUrl(game.imageUrl)} className="w-full h-56 object-cover rounded-2xl mb-6 shadow-inner" crossOrigin={game.imageUrl?.startsWith('http') ? "anonymous" : undefined} referrerPolicy="no-referrer" />
                    <h3 style={{ color: '#ffffff' }} className="text-2xl font-bold truncate mb-2 drop-shadow-md">{game.title}</h3>
                    <div className="flex justify-between items-center mt-auto pt-4">
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)' }} className="font-bold uppercase tracking-widest text-sm">
                        RM
                      </span>
                      <span style={{ color: '#ffffff' }} className="text-4xl font-black drop-shadow-lg">{price}{unitText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div style={{ color: 'rgba(255, 255, 255, 0.7)' }} className="w-full mt-10 text-center text-sm tracking-[0.3em] font-medium uppercase z-10">
              Generated by Switch Dex Studio
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
