import { Component, inject, OnInit } from '@angular/core';
import { LanguageService } from '../language.service';

@Component({
  selector: 'app-lang-switcher',
  templateUrl: './lang-switcher.component.html',
  styleUrls: ['./lang-switcher.component.scss'],
  imports: [],
})
export class LangSwitcherComponent {
   lang = inject(LanguageService);
}
