import { Family } from '../families/family.model';

export type CardRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type ArtSource = 'DEFAULT' | 'PACK' | 'SHOP' | 'EVENT';

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

/** Plus de rareté ni d'image ici : tout est dans les illustrations. */
export interface CardRequest {
  families: string[];
  translations: TranslationRequest[];
  feastDates: FeastDateRequest[];
}

export interface Artist {
  publicId: string;
  name: string;
  bio?: string | null;
  url?: string | null;
}

export interface CardArt {
  publicId: string;
  cardPublicId: string;
  cardTitle?: string | null;
  artist?: Artist | null;
  rarity: CardRarity;
  source: ArtSource;
  imageUrl: string;
  coinPrice?: number | null;
  title?: string | null;
  description?: string | null;
}

export interface ArtTranslationRequest {
  locale: string;
  title?: string | null;
  description?: string | null;
}

export interface CardArtRequest {
  artistPublicId?: string | null;
  rarity: CardRarity;
  source: ArtSource;
  imageUrl: string;
  dropWeight?: number | null;
  coinPrice?: number | null;
  obtainable?: boolean | null;
  translations: ArtTranslationRequest[];
}

export interface Card {
  publicId: string;
  families: Family[];
  locale: string;
  title: string;
  subtitle?: string;
  description?: string;
  feastCountryCode?: string;
  feastMonth?: number;
  feastDay?: number;
  defaultArt?: CardArt | null;
}

export interface CardAdmin {
  publicId: string;
  families: string[];
  translations: { locale: string; title: string; subtitle: string | null; description: string | null }[];
  feastDates: { countryCode: string; month: number; day: number }[];
}
