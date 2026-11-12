import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { ProfileService } from '../profile.service';
import { AuthShellComponent } from '../auth-shell/auth-shell.component';
import { LanguageService } from '../../i18n/language.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['../auth-form.scss'],
  imports: [ReactiveFormsModule, TranslocoPipe
  ],
})
export class OnboardingComponent {
  private fb = inject(FormBuilder);
  private profiles = inject(ProfileService);
  private router = inject(Router);
  private lang = inject(LanguageService);

  public loading: boolean = false;
  public error: string = '';

  private countryCodes = ['FR', 'CL', 'ES', 'BE', 'CH', 'CA', 'US', 'GB', 'DE', 'IT'];

  countries = computed(() => {
    const names = new Intl.DisplayNames([this.lang.current()], { type: 'region' });
    return this.countryCodes
      .map((code) => ({ code, name: names.of(code) ?? code }))
      .sort((a, b) => a.name.localeCompare(b.name, this.lang.current()));
  });

  languages = this.lang.supported;

  form = this.fb.nonNullable.group({
    pseudo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    country: ['', Validators.required],
    language: [this.lang.current(), Validators.required],
  });

  constructor() {
    this.form.controls.language.valueChanges.subscribe((l) => this.lang.set(l));
  }

  submit() {
    this.loading = true;
    this.error = '';
    this.profiles.create(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/cards']),
      error: (e: HttpErrorResponse) => {
        this.loading = false;
        this.error = e.status === 409 ? 'auth.errors.pseudoTaken' : 'auth.errors.generic';
      },
    });
  }
}
