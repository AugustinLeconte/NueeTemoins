import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['../auth-form.scss'],
   imports: [ReactiveFormsModule],
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  async submit() {
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.getRawValue();
    const { error } = await this.auth.signUp(email, password, email.split('@')[0]);
    this.loading = false;
    if (error) { this.error = error.message ?? 'Inscription impossible'; return; }
    this.router.navigate(['/onboarding']);
  }

  google() {
    this.auth.signInWithGoogle();
  }
}
