export type CardFamily = 'FIRE' | 'WATER' | 'GRASS';
export type CardRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' ;

export interface CardRequest {
  family: CardFamily;
  rarity: CardRarity;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
}
export interface Card extends CardRequest { id: string; }
