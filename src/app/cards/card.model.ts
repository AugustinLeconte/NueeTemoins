import { Family } from "../families/family.model";

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
  families: string[];
  rarity: CardRarity;
  imageUrl?: string;
  translations: { locale: string; title: string; subtitle?: string; description?: string }[];
  feastDates: { countryCode: string; month: number; day: number }[];
}

export interface Card {
  publicId: string;
  families: Family[];
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

export interface CardAdmin {
  publicId: string; families: string[]; rarity: string; imageUrl: string | null;
  translations: { locale: string; title: string; subtitle: string | null; description: string | null }[];
  feastDates: { countryCode: string; month: number; day: number }[];
}
