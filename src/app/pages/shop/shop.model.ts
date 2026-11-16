import { CardArt } from "../../cards/card.model";

export interface ShopItem {
  art: CardArt;
  price: number;
  owned: boolean;
}

export interface FreeOffers {
  dailyCoins: number;
  dailyAvailable: boolean;
  adCoins: number;
  adRemaining: number;
  adMax: number;
}
