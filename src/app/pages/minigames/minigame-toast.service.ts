import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';

const KNOWN = ['UNKNOWN_CARD', 'ALREADY_GUESSED', 'ALREADY_FINISHED', 'FINISH_FIRST', 'INVALID_TILE'];

@Injectable({ providedIn: 'root' })
export class MinigameToast {
  private toast = inject(ToastController);
  private i18n = inject(TranslocoService);

  async say(code: string): Promise<void> {
    const message = await firstValueFrom(this.i18n.selectTranslate(`minigames.errors.${code}`));
    (await this.toast.create({ message, duration: 1500, position: 'top' })).present();
  }

  fromError(err: HttpErrorResponse, statusFallback: Record<number, string> = {}): void {
    const code = err.error?.message ?? err.error?.reason;
    void this.say(KNOWN.includes(code) ? code : (statusFallback[err.status] ?? 'ERROR'));
  }
}
