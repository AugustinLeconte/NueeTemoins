import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { ellipsisHorizontal, homeOutline, sunnyOutline, openOutline, helpCircleOutline } from 'ionicons/icons';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/auth/auth.interceptor';
import { inject, isDevMode, provideAppInitializer } from '@angular/core';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco } from '@jsverse/transloco';
import { AdProvider } from './app/ads/ad-provider';
import { AdMobProvider } from './app/ads/admob.provider';
import { WebAdProvider } from './app/ads/web-ad.provider';
import { Capacitor } from '@capacitor/core';

addIcons({
  // Icônes Ionicons
  ellipsisHorizontal,
  homeOutline,
  sunnyOutline,
  openOutline,
  helpCircleOutline,
  // Icônes custom
  'custom-collection': 'assets/icons/collection-solid-svgrepo-com.svg',
  'custom-packs': 'assets/icons/poker-cards-svgrepo-com.svg',
  'custom-shop': 'assets/icons/shop-cart-svgrepo-com.svg',
  'custom-wordle': 'assets/icons/wordlesolver-svgrepo-com.svg',
  'custom-friends': 'assets/icons/icons8-friends.svg',
  'custom-memory': 'assets/icons/icons8-memory-game.svg',
  'custom-guess-card': 'assets/icons/icons8-card-game.svg',
});

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: AdProvider, useClass: Capacitor.isNativePlatform() ? AdMobProvider : WebAdProvider },
    provideAppInitializer(() => {
      inject(AdProvider).init();
    }),
    provideIonicAngular({ animated: false }),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    provideTransloco({
      config: {
        availableLangs: ['fr', 'es', 'en'],
        defaultLang: 'fr',
        fallbackLang: 'fr',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
  ],
});
