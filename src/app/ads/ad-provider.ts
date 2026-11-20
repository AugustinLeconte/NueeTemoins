import { Injectable, signal, Signal } from '@angular/core';

export type RewardResult = 'rewarded' | 'dismissed' | 'unavailable';

export abstract class AdProvider {
  abstract readonly available: Signal<boolean>;
  abstract init(): Promise<void>;
  abstract showRewarded(): Promise<RewardResult>;
}
