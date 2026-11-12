import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '../auth.service';
import { AuthShellComponent } from '../auth-shell/auth-shell.component';

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

  public loading: boolean = false;
  public error: string = '';
  public form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  async submit() {
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.getRawValue();
    const { error } = await this.auth.signUp(email, password, email.split('@')[0]);
    this.loading = false;
    if (error) {
      this.error = 'auth.errors.signupFailed';
      return;
    }
    this.router.navigate(['/onboarding']);
  }

  google() {
    this.auth.signInWithGoogle();
  }
}
