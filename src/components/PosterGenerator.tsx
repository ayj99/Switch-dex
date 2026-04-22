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
    if (triggerId === null || !containerRef.current) return;

    let isCancelled = false;

    const capture = async () => {
      try {
        // 强制等待 DOM 重绘
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => setTimeout(resolve, 100));

        if (isCancelled || !containerRef.current) return;

        // 确保图片加载完成
        const images = Array.from(containerRef.current.querySelectorAll('img'));
        await Promise.all(
          images.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          })
        );

        if (isCancelled || !containerRef.current) return;

        // 修复 html2canvas 配置，增加准确的窗口系数量
        const canvas = await html2canvas(containerRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          logging: false,
          width: 800, // 强制锁定画布宽度
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

  if (triggerId === null) return null;

  const posterGames = games.slice(0, 12);
  const isRental = type === 'rental';
  const labelText = isRental ? 'RENT' : 'BUY';
  const unitText = isRental ? '/mo' : '';

  return (
    // 【修复定位】使用 absolute 和 -left-[9999px] 确保在真实 DOM 文档流外，且不会引起视口错误
    <div className="absolute top-0 -left-[9999px] w-[800px] pointer-events-none z-[-50]">
      <div ref={containerRef} className="w-[800px] flex flex-col">
        
        {/* Template 0: 极简官方风 (纯白底，灰边框，截图 100% 成功) */}
        {triggerId === 0 && (
          <div className="bg-white p-10 flex flex-col w-full text-gray-900 border-[16px] border-gray-100 min-h-[800px]">
            <div className="flex items-center justify-between border-b-2 border-gray-200 pb-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full border-2 border-gray-900 flex items-center justify-center font-black text-2xl bg-white">
                  SD
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-gray-900 leading-none">Switch Dex</h1>
                  <p className="text-gray-500 font-bold tracking-widest uppercase text-sm mt-1">Official Collection</p>
                </div>
              </div>
              <div className="bg-gray-900 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm">
                {labelText} SELECTION
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 flex-grow">
              {posterGames.slice(0, 9).map((game) => {
                const price = isRental ? Math.floor(game.price * 0.07) : game.price;
                return (
                  <div key={game.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 flex flex-col">
                    <img src={game.imageUrl} className="w-full aspect-[3/4] object-cover rounded-lg mb-4" referrerPolicy="no-referrer" />
                    <h3 className="text-lg font-bold truncate text-gray-900 mb-2">{game.title}</h3>
                    <p className="text-gray-900 font-black text-2xl mt-auto">RM {price}<span className="text-sm font-normal text-gray-500">{unitText}</span></p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Template 1: 深邃极客风 (彻底摒弃 blur 滤镜，改用实打实的深色背景和青色实线边框) */}
        {triggerId === 1 && posterGames.length > 0 && (
          <div className="bg-slate-900 p-10 flex flex-col w-full text-white border-8 border-cyan-500 min-h-[800px]">
             <div className="flex justify-between items-end mb-10 border-b-2 border-cyan-900 pb-6">
                <div>
                  <h1 className="text-6xl font-black tracking-tighter uppercase text-cyan-400">
                    CYBER<br/>{labelText}
                  </h1>
                </div>
                <div className="w-16 h-16 rounded-xl border-4 border-cyan-500 flex items-center justify-center font-black text-2xl bg-slate-800 text-cyan-400">
                  SD
                </div>
             </div>

             <div className="grid grid-cols-2 gap-6">
               {posterGames.slice(0, 6).map((game) => {
                 const price = isRental ? Math.floor(game.price * 0.07) : game.price;
                 return (
                   <div key={game.id} className="bg-slate-800 border-2 border-cyan-700 rounded-xl p-4 flex gap-4">
                     <img src={game.imageUrl} className="w-24 h-32 object-cover rounded border-2 border-slate-700" referrerPolicy="no-referrer" />
                     <div className="flex flex-col justify-center flex-1 min-w-0">
                       <h3 className="text-lg font-bold leading-tight mb-2 text-slate-100">{game.title}</h3>
                       <p className="text-cyan-400 font-black text-3xl">
                         <span className="text-sm text-cyan-600 mr-1">RM</span>{price}{unitText}
                       </p>
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}

        {/* Template 2: 活力紫电风 (摒弃毛玻璃，使用高饱和纯紫色背景和白色卡片对比) */}
        {triggerId === 2 && (
          <div className="bg-indigo-600 p-12 flex flex-col w-full min-h-[800px]">
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl border-4 border-white flex items-center justify-center font-black text-2xl bg-indigo-500 text-white">
                  SD
                </div>
                <h1 className="text-5xl font-black tracking-tight text-white leading-tight">
                  Trending<br/>Now
                </h1>
              </div>
              <div className="bg-white text-indigo-700 px-6 py-3 rounded-2xl font-black text-xl tracking-widest shadow-lg">
                {labelText}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 flex-grow">
              {posterGames.slice(0, 4).map(game => {
                const price = isRental ? Math.floor(game.price * 0.07) : game.price;
                return (
                   // 卡片改用实心白色，抛弃容易截图失败的 backdrop-blur 半透明效果
                  <div key={game.id} className="bg-white rounded-3xl p-6 flex flex-col shadow-xl border-4 border-indigo-400">
                    <img src={game.imageUrl} className="w-full aspect-[4/3] object-cover rounded-2xl mb-6 border-2 border-gray-100" referrerPolicy="no-referrer" />
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{game.title}</h3>
                    <div className="flex justify-between items-center mt-auto pt-4">
                      <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                        RM
                      </span>
                      <span className="text-4xl font-black text-indigo-600">{price}{unitText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="w-full mt-10 text-center text-white font-bold tracking-[0.2em] uppercase">
              Generated by Switch Dex Studio
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
