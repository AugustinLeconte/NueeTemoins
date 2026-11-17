import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../auth.service';
import { normalizeAuthError, NormalizedAuthError } from '../auth-error.util';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../auth-form.scss'],
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public loading = signal(false);
  public error = signal<Pick<NormalizedAuthError, 'key' | 'params'> | null>(null);
  public form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  async submit() {
    if (this.loading() || this.form.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();

    try {
      console.debug('[auth] login attempt', { email });
      const { error } = await this.auth.signIn(email, password);

      if (error) {
        this.handleError(error, email);
        return;
      }

      console.info('[auth] login success', { email });
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const safe = returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//');
      await this.router.navigateByUrl(safe ? returnUrl : '/cards');
    } catch (err) {
      // signIn peut lever une exception (AuthApiError, erreur réseau...)
      this.handleError(err, email);
    } finally {
      this.loading.set(false);
    }
  }

  private handleError(err: unknown, email: string) {
    const { key, params, debug } = normalizeAuthError(err, 'login'); // 'signup' côté inscription
    console.error('[auth] login failed', { email, ...debug, raw: err });
    this.error.set({ key, params });
  }

  public google() {
    try {
      console.debug('[auth] google sign-in started');
      this.auth.signInWithGoogle();
    } catch (err) {
      const { key, params, debug } = normalizeAuthError(err, 'login');
      console.error('[auth] google sign-in failed', { ...debug, raw: err });
      this.error.set({ key, params });
    }
  }
}
