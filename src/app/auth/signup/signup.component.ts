import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../auth.service';
import { normalizeAuthError, NormalizedAuthError } from '../auth-error.util';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['../auth-form.scss'],
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe],
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  public loading = signal(false);
  public error = signal<Pick<NormalizedAuthError, 'key' | 'params'> | null>(null);
  public form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  async submit() {
    if (this.loading() || this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();

    try {
      console.debug('[auth] signup attempt', { email });
      const { error } = await this.auth.signUp(email, password, email.split('@')[0]);

      if (error) {
        this.handleError(error, email);
        return;
      }

      console.info('[auth] signup success', { email });
      await this.router.navigate(['/onboarding']);
    } catch (err) {
      this.handleError(err, email);
    } finally {
      this.loading.set(false);
    }
  }

  private handleError(err: unknown, email: string) {
    const { key, params, debug } = normalizeAuthError(err, 'signup');
    console.error('[auth] signup failed', { email, ...debug, raw: err }); // "signup" et non "login"
    this.error.set({ key, params });
  }

  public google() {
    try {
      console.debug('[auth] google sign-in started');
      this.loading.set(true);
      this.auth.signInWithGoogle();
    } catch (err) {
      const { key, params, debug } = normalizeAuthError(err, 'signup');
      console.error('[auth] google sign-in failed', { ...debug, raw: err });
      this.error.set({ key, params });
      this.loading.set(false);
    }
  }
}
