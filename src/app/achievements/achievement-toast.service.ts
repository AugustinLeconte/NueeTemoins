import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class AchievementToastService {
  private toastCtrl = inject(ToastController);
  private i18n = inject(TranslocoService);

  async show(codes?: string[] | null) {
    if (!codes?.length) return;
    const names = codes.map(c => this.i18n.translate(`achievements.items.${c}.name`));
    const toast = await this.toastCtrl.create({
      header: this.i18n.translate('achievements.unlocked'),
      message: names.join(' · '),
      icon: 'trophy',
      color: 'success',
      position: 'top',
      duration: 3500,
    });
    await toast.present();
  }
}
