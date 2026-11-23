import { Component, inject } from '@angular/core';
import { PlayerService } from '../../player/player.service';

@Component({
  selector: 'app-currency-bar',
  standalone: true,
  template: `@if (player.walletState(); as w) {
    <span class="cur">💰 {{ w.coins }}</span
    ><span class="cur">🃏 {{ w.packs }}</span>
  }`,
  styles: [
    `
      .cur {
        margin-right: 10px;
        font-weight: 600;
      }
    `,
  ],
})
export class CurrencyBarComponent {
  player = inject(PlayerService);
}
