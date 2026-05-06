我发现在真实数据量较大时，PosterGenerator.tsx 会因为同时绘制过多画布而导致浏览器内存溢出（OOM）或严重卡顿。
请帮我优化 PosterGenerator.tsx 组件，加入数据截断机制和渲染降级，请进行以下 3 处精确修改：

1. 限制生成的最大数量 (截取前 36 个)
找到 chunkedGames 的生成逻辑。请将其修改为最多只处理 36 个游戏（即最多生成 3 页海报），避免浏览器崩溃。

JavaScript
const chunkedGames = [];
// 强制截断：无论传进来多少游戏，只取前 36 个进行渲染
const safeGames = games.slice(0, 36); 
for (let i = 0; i < safeGames.length; i += 12) {
  chunkedGames.push(safeGames.slice(i, i + 12));
}
2. 优化页码显示的逻辑
在底部的 Footer 中，原本渲染总页数的地方 <span>{pageIndex + 1} / {chunkedGames.length}</span> 保持不变。但在组件顶部可以预留一个常数供未来扩展使用：
const hasMore = games.length > 36;

3. 稍微降低导出画布的像素倍率 (释放内存)
找到 html2canvas 的配置对象：

JavaScript
const canvas = await html2canvas(page, {
  scale: 1.5, // 从 2 降为 1.5，肉眼保持清晰的同时内存占用减半
  useCORS: true,
  allowTaint: false,
  backgroundColor: '#E60012',
  logging: false,
});
请直接应用以上修改，解决海报生成卡死的问题。
