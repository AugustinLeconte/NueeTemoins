import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe],
  templateUrl: './forgot-password.page.html',
  styleUrls: ['../auth-form.scss'],
})
export class ForgotPasswordPage {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  loading = signal(false);
  sent = signal(false);

  async submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    try {
      await this.auth.requestPasswordReset(this.form.getRawValue().email);
    } catch {
    } finally {
      this.loading.set(false);
      this.sent.set(true);
    }
  }
}
