import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslocoPipe],
  templateUrl: './reset-password.page.html',
  styleUrls: ['../auth-form.scss'],
})
export class ResetPasswordPage {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private token = this.route.snapshot.queryParamMap.get('token');
  invalidLink = signal(!this.token || this.route.snapshot.queryParamMap.has('error'));

  form = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
  });
  loading = signal(false);
  error = signal(false);

  async submit() {
    if (this.form.invalid || !this.token) return;
    this.loading.set(true);
    this.error.set(false);
    try {
      const { error } = await this.auth.resetPassword(this.form.getRawValue().password, this.token);
      if (error) throw error;
      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
