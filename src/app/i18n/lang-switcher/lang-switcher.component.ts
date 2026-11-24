import { Component, inject, OnInit } from '@angular/core';
import { LanguageService } from '../language.service';
import { IonItem, IonSelect, IonSelectOption } from '@ionic/angular';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-lang-switcher',
  templateUrl: './lang-switcher.component.html',
  styleUrls: ['./lang-switcher.component.scss'],
  imports: [],
})
export class LangSwitcherComponent {
  lang = inject(LanguageService);
}
