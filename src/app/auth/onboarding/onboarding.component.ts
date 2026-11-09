import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../profile.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['../auth-form.scss'],
   imports: [ReactiveFormsModule],
})
export class OnboardingComponent {
  private fb = inject(FormBuilder);
  private profiles = inject(ProfileService);
  private router = inject(Router);

  loading = false;
  error = '';

  countries = [
    { code: 'FR', name: 'France' }, { code: 'CL', name: 'Chile' },
  ];
  languages = [
    { code: 'fr', name: 'Français' }, { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
  ];

  form = this.fb.nonNullable.group({
    pseudo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    country: ['', Validators.required],
    language: [navigator.language.slice(0, 2), Validators.required],
  });

  submit() {
    this.loading = true;
    this.error = '';
    this.profiles.create(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/cards']),
      error: (e: HttpErrorResponse) => {
        this.loading = false;
        this.error = e.status === 409 ? 'Ce pseudo est déjà pris' : 'Une erreur est survenue';
      },
    });
  }
}
