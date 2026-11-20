import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { AdProvider, RewardResult } from './ad-provider';

declare global {
  interface Window {
    adsbygoogle: unknown[];
    adBreak: (o: unknown) => void;
    adConfig: (o: unknown) => void;
  }
}

@Injectable()
export class WebAdProvider extends AdProvider {
  readonly available = signal(false);

  async init() {
    const client = environment.webAdsClient; // 'ca-pub-XXXXXXXX', vide = désactivé
    if (!client) return;

    window.adsbygoogle = window.adsbygoogle || [];
    window.adBreak = window.adConfig = (o: unknown) => {
      window.adsbygoogle.push(o);
    };

    await new Promise<void>((resolve) => {
      const s = document.createElement('script');
      s.async = true;
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
      s.crossOrigin = 'anonymous';
      if (!environment.production) s.setAttribute('data-adbreak-test', 'on'); // pubs de test
      s.onload = () => resolve();
      s.onerror = () => resolve(); // bloqueur de pub : on reste indisponible
      document.head.appendChild(s);
    });

    if (!window.adConfig) return;
    window.adConfig({
      preloadAdBreaks: 'on',
      sound: 'on',
      onReady: () => this.available.set(true),
    });
  }

  showRewarded(): Promise<RewardResult> {
    return new Promise((resolve) => {
      let viewed = false;
      window.adBreak({
        type: 'reward',
        name: 'shop-coins',
        beforeReward: (showAd: () => void) => showAd(),
        adViewed: () => {
          viewed = true;
        },
        adBreakDone: (info: { breakStatus: string }) => {
          resolve(viewed ? 'rewarded' : info.breakStatus === 'dismissed' ? 'dismissed' : 'unavailable');
        },
      });
    });
  }
}
