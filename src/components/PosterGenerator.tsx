import React, { useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';

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
            if (img.complete || !img.src) return Promise.resolve();
            return new Promise((resolve) => {
              const timeout = setTimeout(resolve, 3000); // 3s max wait per image
              img.onload = () => { clearTimeout(timeout); resolve(null); };
              img.onerror = () => { clearTimeout(timeout); resolve(null); }; // Resolve anyway to avoid infinite hang on broken/cors images
            });
          })
        );

        if (isCancelled || !containerRef.current) return;

        // 4. Capture using html-to-image which natively relies on browser rendering (avoids oklch parser bugs)
        const imgData = await toPng(containerRef.current, {
          pixelRatio: 2,
          backgroundColor: '#E60012',
          style: { opacity: '1', transform: 'none' }, // Ensure no hidden styles affect render
        });

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
    <div className="fixed top-0 z-[-9999]" style={{ left: '-10000px' }}>
      <div ref={containerRef} className="w-[800px] flex flex-col min-h-[800px]" style={{ backgroundColor: '#E60012' }}>
        <div className="p-10 flex flex-col w-full h-full">
          {/* Header */}
          <div className="flex justify-between items-end mb-10 pb-6" style={{ borderBottomWidth: 2, borderBottomStyle: 'solid', borderColor: 'rgba(255,255,255,0.2)' }}>
            <div className="text-4xl font-black italic tracking-tighter font-sans select-none" style={{ color: '#ffffff' }}>
              S<span style={{ color: '#000000' }}>x</span>ítčh D<span style={{ color: '#ffffff' }}>é</span><span style={{ color: '#000000' }}>x</span>
            </div>
              <div className="px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
                {labelText} SELECTION
              </div>
            </div>

            <div className="flex flex-wrap gap-6 justify-between flex-grow">
              {posterGames.slice(0, 9).map((game) => {
                const price = isRental ? Math.floor(game.price * 0.06) : game.price;
                return (
                  <div key={game.id} className="w-[calc(33.333%-16px)] rounded-xl p-4 flex flex-col" style={{ backgroundColor: '#ffffff', borderColor: '#f3f4f6', borderWidth: 1, borderStyle: 'solid' }}>
                    <img 
                      src={getSafeImageUrl(game.imageUrl)} 
                      className="w-full aspect-[3/4] object-cover rounded-lg mb-4" 
                      style={{ borderColor: '#f3f4f6', borderWidth: 1, borderStyle: 'solid' }} 
                      crossOrigin={game.imageUrl?.startsWith('http') ? "anonymous" : undefined} 
                      referrerPolicy="no-referrer" 
                      onError={(e) => { e.currentTarget.src = '/images/logo.png' }}
                    />
                    <h3 className="text-lg font-bold truncate mb-2" style={{ color: '#111827' }}>{game.title}</h3>
                    <div className="mt-auto">
                      <p className="font-black text-2xl" style={{ color: '#E60012' }}>RM {price}<span className="text-sm font-normal ml-1" style={{ color: '#6b7280' }}>{unitText}</span></p>
                    </div>
                  </div>
                );
              })}
            </div>

          <div className="w-full mt-10 text-center text-xs tracking-[0.3em] font-bold uppercase" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Generated by Switch Dex Studio
          </div>
        </div>
      </div>
    </div>
  );
}
