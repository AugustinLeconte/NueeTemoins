import { Component, OnInit } from '@angular/core';
import { LangSwitcherComponent } from '../../i18n/lang-switcher/lang-switcher.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-shell',
  templateUrl: './auth-shell.component.html',
  styleUrls: ['./auth-shell.component.scss'],
  imports: [RouterOutlet, LangSwitcherComponent],
})
export class AuthShellComponent  {
}
