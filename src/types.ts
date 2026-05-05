export type BadgeType = 'SALE' | 'NEW ITEM' | 'HOT SELLING';

export interface Game {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  isSale?: boolean;
  badge?: string; // 比如 'NEW', 'HOT'
  condition: string; 
  imageUrl: string;
  players: string;
  language: string;
  genre: string;       // 核心玩法（单选）：如 '动作冒险', '角色扮演'
  category: string;    // 场景受众（CSV里可能是逗号分隔的字符串，如 'Multiplayer多人,家庭Kids'）
  subcategory: string; // 细分说明（仅展示）：如 '马力欧系列', '体感跳舞'
  description?: string;
  votes: number;
  status: string; 
}

export const PHONE_NUMBER = "601155088426";
