export type CardFamily = 'FIRE' | 'WATER' | 'GRASS';
export type CardRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface TranslationRequest {
  locale: string;
  title: string;
  subtitle?: string;
  description?: string;
}

export interface FeastDateRequest {
  countryCode: string;
  month: number;
  day: number;
}

export interface CardRequest {
  publicId: string;
  family: CardFamily;
  rarity: CardRarity;
  imageUrl?: string;
  translations: TranslationRequest[];
  feastDates: FeastDateRequest[];
}

export interface Card {
  publicId: string;
  family: CardFamily;
  rarity: CardRarity;
  imageUrl?: string;
  locale: string;
  title: string;
  subtitle?: string;
  description?: string;
  countryCode?: string;
  feastMonth?: number;
  feastDay?: number;
}
