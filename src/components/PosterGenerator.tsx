import React, { useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

export interface PosterGeneratorProps {
  games: any[];
  type: 'rental' | 'shop';
  triggerId: number | null;
  onGenerated: (imgUrls: string[]) => void;
  onError?: (err: any) => void;
}

export default function PosterGenerator({ games, type, triggerId, onGenerated, onError }: PosterGeneratorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 终极防御 1：如果没有任何游戏数据，直接拦截，防止 Shop 报错！
    if (triggerId === null || !containerRef.current || !games || games.length === 0) return;

    let isCancelled = false;

    const capture = async () => {
      try {
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => setTimeout(resolve, 500)); // 稍微多等一下图片/字体加载

        if (isCancelled || !containerRef.current) return;

        const images = Array.from(containerRef.current.querySelectorAll('img')) as HTMLImageElement[];
        await Promise.all(
          images.map((img) => {
            if (img.complete || !img.src) return Promise.resolve();
            return new Promise((resolve) => {
              const timeout = setTimeout(resolve, 3000); 
              img.onload = () => { clearTimeout(timeout); resolve(null); };
              // 终极防御 2：图片坏了直接替换为 Logo，绝不让截图引擎自爆
              img.onerror = () => { 
                clearTimeout(timeout); 
                img.src = '/images/logo.png'; 
                resolve(null); 
              }; 
            });
          })
        );

        if (isCancelled || !containerRef.current) return;

        const pages = Array.from(containerRef.current.querySelectorAll('.poster-page')) as HTMLElement[];
        const generatedImages: string[] = [];

        for (const page of pages) {
          if (isCancelled) return;
          const canvas = await html2canvas(page, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#E60012', // 整体底色保持任天堂红
            logging: false,
          });
          generatedImages.push(canvas.toDataURL('image/jpeg', 0.9));
        }

        if (isCancelled) return;

        onGenerated(generatedImages);

      } catch (err) {
        console.error('Failed to generate poster:', err);
        if (!isCancelled && onError) onError(err);
      }
    };

    capture();

    return () => { isCancelled = true; };
  }, [triggerId, games, type, onGenerated, onError]);

  if (triggerId === null || !games || games.length === 0) return null;

  const chunkedGames = [];
  for (let i = 0; i < games.length; i += 12) {
    chunkedGames.push(games.slice(i, i + 12));
  }

  const isRental = type === 'rental';
  const labelText = isRental ? 'RENT' : 'BUY';
  const unitText = isRental ? '/mo' : '';

  // 代理图片，防止跨域
  const getSafeImageUrl = (url: string | undefined) => {
    if (!url) return '/images/logo.png';
    if (url.startsWith('blob:') || url.startsWith('data:')) return url;
    if (url.startsWith('http')) {
      return `https://wsrv.nl/?url=${encodeURIComponent(url)}&output=webp`;
    }
    return url;
  };

  return (
    <div className="fixed top-0 left-0 z-[-9999] opacity-0 pointer-events-none" style={{ position: 'fixed', left: '-10000px' }}>
      
      {/* 海报主容器 */}
      <div ref={containerRef} className="flex flex-col gap-10">
        {chunkedGames.map((pageGames, pageIndex) => (
          <div key={`page-${pageIndex}`} className="poster-page w-[800px] flex flex-col min-h-[800px]" style={{ backgroundColor: '#E60012' }}>
            
            {/* 1. 恢复白色区间 Header */}
            <div className="w-full bg-white p-10 flex flex-col justify-center border-b-8 relative" style={{ borderColor: '#111827' }}>
              
              <div className="flex items-center justify-between w-full">
                
                {/* Header 左侧：Logo 组合 */}
                <div className="flex items-center gap-4">
                  {/* 2. 恢复你的图片 Logo */}
                  <img src="/images/logo.png" alt="Logo" className="h-14 w-auto object-contain" crossOrigin="anonymous" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  
                  {/* 红黑文字 Logo */}
                  <div className="text-5xl font-black italic tracking-tighter font-sans select-none" style={{ color: '#111827' }}>
                    S<span style={{ color: '#E60012' }}>x</span>ítčh D<span style={{ color: '#111827' }}>é</span><span style={{ color: '#E60012' }}>x</span>
                  </div>
                </div>

                {/* Header 右侧：Slogan 与 Category */}
                <div className="flex flex-col items-end">
                  {/* 3. 恢复中文 Slogan */}
                  <p className="text-2xl font-black tracking-widest" style={{ color: '#374151' }}>
                    诗和远方，和 Switch 奇
                  </p>
                  {/* 醒目的 Category */}
                  <p className="text-xl font-black mt-1" style={{ color: '#eab308' }}>
                    亲子游戏 系列精选
                  </p>
                </div>
              </div>

              {/* 右下角的 RENT/BUY 角标，改为绝对定位使其不干扰基础流 */}
              <div className="absolute bottom-[-18px] right-10 px-6 py-2 border-4 rounded-full font-black uppercase tracking-widest text-sm z-10" style={{ backgroundColor: '#111827', color: '#ffffff', borderColor: '#E60012' }}>
                {labelText} SELECTION
              </div>
            </div>

            {/* 游戏网格区域 (改为 4x3) */}
            <div className="p-8 flex flex-wrap gap-4 justify-start flex-grow">
              {pageGames.map((game, index) => {
                const price = isRental ? Math.floor(game.price * 0.06) : game.price;
                return (
                  <div key={game.id} className="w-[calc(25%-12px)] rounded-xl p-3 flex flex-col shadow-xl" style={{ backgroundColor: '#ffffff' }}>
                    
                    {/* 图片与浮动标签容器 */}
                    <div className="relative w-full aspect-[3/4] mb-3">
                      <img 
                        src={getSafeImageUrl(game.imageUrl)} 
                        alt={game.title}
                        className="w-full h-full object-cover rounded-lg border" 
                        style={{ borderColor: '#f3f4f6' }} 
                        crossOrigin="anonymous" 
                        onError={(e) => { e.currentTarget.src = '/images/logo.png'; }}
                      />
                      
                      {/* 4. 恢复 Floating 悬浮标签 */}
                      {isRental && (
                        <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-black shadow-md border" style={{ backgroundColor: 'rgba(0,0,0,0.85)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' }}>
                          30/5% - 10%
                        </div>
                      )}
                    </div>

                    <h3 className="text-sm font-bold truncate mb-1" style={{ color: '#111827' }}>{game.title}</h3>
                    
                    <div className="mt-auto">
                      <p className="font-black text-xl" style={{ color: '#E60012' }}>
                        RM {price}<span className="text-xs font-normal ml-1" style={{ color: '#6b7280' }}>{unitText}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="w-full pb-8 flex justify-between px-10 text-sm tracking-[0.2em] font-bold uppercase" style={{ color: 'rgba(255,255,255,0.9)' }}>
              <span>Generated by Switch Dex Studio</span>
              <span>{pageIndex + 1} / {chunkedGames.length}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
