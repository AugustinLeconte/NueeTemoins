import { Card, CardArt } from '../cards/card.model';

export interface Wallet {
  coins: number;
  packsSinceRare: number;
  dailyPackAvailable: boolean;
  newAchievements?: string[];
}

export interface PlayerCard {
  card: Card;
  level: number;
  fragments: number;
  equippedArt: CardArt;
  ownedArts: CardArt[];
  nextUpgradeCost: number | null;
}

export interface DrawnItem {
  type: 'ART' | 'COINS';
  art: CardArt | null;
  newArt: boolean;
  newCard: boolean;
  fragmentsGained: number;
  cardFragments: number | null;
  cardLevel: number | null;
  nextUpgradeCost: number | null;
  coinsGained: number;
}

export interface PlayerProgress {
  level: number;
  xp: number;
  xpIntoLevel: number;
  xpForNextLevel: number | null;
  unclaimedPacks: number;
}

export interface PackResult {
  packType: string;
  draws: DrawnItem[];
  coinsGained: number;
  coins: number;
  packsSinceRare: number;
  xpGained: number;
  levelBefore: number;
  progress: PlayerProgress;
  newAchievements?: string[];
}

export interface PackOffer {
  level: number;
  packType: 'STANDARD' | 'PREMIUM';
  size: number;
  status: 'LOCKED' | 'AVAILABLE' | 'OPENED';
}

export interface UpgradeResult {
  level: number;
  fragments: number;
  nextUpgradeCost: number | null;
  xpGained: number;
  playerLevelUp: boolean;
  progress: PlayerProgress;
  newAchievements?: string[];
}

export interface ShopItem {
  art: CardArt;
  price: number;
  owned: boolean;
}

export interface Achievement {
  code: string;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  target: number;
}
