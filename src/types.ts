export type BadgeType = 'SALE' | 'NEW ITEM' | 'HOT SELLING';

export interface Game {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  isSale?: boolean;
  badge?: BadgeType;
  condition: string; 
  imageUrl: string;
  players: string;
  language: string;
  genre: string;
  description: string;
  category: string; 
  votes: number;
  status: string; 
}

export const PHONE_NUMBER = "601155088426";
