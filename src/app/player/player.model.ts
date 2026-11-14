import { Card, CardArt } from '../cards/card.model';

export interface Wallet {
  fragments: number;
  packsSinceRare: number;
  dailyPackAvailable: boolean;
}

export interface PlayerCard {
  card: Card;
  level: number;
  equippedArt: CardArt;
  ownedArts: CardArt[];
  nextUpgradeCost: number | null;
}

export interface DrawnArt {
  art: CardArt;
  newArt: boolean;
  newCard: boolean;
  fragmentsGained: number;
}

export interface PackResult {
  draws: DrawnArt[];
  fragmentsGained: number;
  fragments: number;
  packsSinceRare: number;
}

export interface ShopItem {
  art: CardArt;
  price: number;
  owned: boolean;
}
