import { Card, CardArt } from '../cards/card.model';

export interface Wallet {
  coins: number;
  packsSinceRare: number;
  dailyPackAvailable: boolean;
}

export interface PlayerCard {
  card: Card;
  level: number;
  /** fragments de CE saint (doublons) */
  fragments: number;
  equippedArt: CardArt;
  ownedArts: CardArt[];
  /** null si niveau maximum */
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
  /** null au niveau maximum */
  xpForNextLevel: number | null;
  /** packs de niveau débloqués mais pas encore ouverts */
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
}

export interface ShopItem {
  art: CardArt;
  price: number;
  owned: boolean;
}
