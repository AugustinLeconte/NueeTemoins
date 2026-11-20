import { Injectable, signal } from '@angular/core';
import { AdMob, AdmobConsentStatus, RewardAdPluginEvents } from '@capacitor-community/admob';
import { PluginListenerHandle } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { AdProvider, RewardResult } from './ad-provider';

@Injectable()
export class AdMobProvider extends AdProvider {
  readonly available = signal(false);

  async init() {
    try {
      await AdMob.initialize();
      const info = await AdMob.requestConsentInfo();
      if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) {
        await AdMob.showConsentForm();
      }
      this.available.set(true);
    } catch {
      this.available.set(false);
    }
  }

  async showRewarded(): Promise<RewardResult> {
    let rewarded = false;
    const handles: PluginListenerHandle[] = [];
    try {
      const finished = new Promise<void>(async (resolve) => {
        handles.push(
          await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
            rewarded = true;
          }),
        );
        handles.push(await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => resolve()));
        handles.push(await AdMob.addListener(RewardAdPluginEvents.FailedToShow, () => resolve()));
      });
      await AdMob.prepareRewardVideoAd({ adId: environment.rewardedAdId });
      await AdMob.showRewardVideoAd();
      await finished;
      return 'rewarded';
    } catch {
      return 'unavailable';
    } finally {
      await Promise.all(handles.map((h) => h.remove()));
    }
  }
}
