import { Signal } from '@angular/core';

export abstract class AdProvider {
  abstract readonly available: Signal<boolean>;
  abstract init(): Promise<void>;
  abstract showRewarded(): Promise<boolean>;
}
