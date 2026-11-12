import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { AuthShellComponent } from '../auth-shell/auth-shell.component';
import { TranslocoPipe } from '@jsverse/transloco';

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

  public loading: boolean = false;
  public error: string = '';
  public form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  async submit() {
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.getRawValue();
    const { error } = await this.auth.signIn(email, password);
    this.loading = false;
    if (error) {
      this.error = error.code === 'invalid_credentials'
        ? 'auth.errors.invalidCredentials'
        : 'auth.errors.loginFailed';
      return;
    }
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const safe = returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//');
    this.router.navigateByUrl(safe ? returnUrl : '/cards');
  }

  google() {
    this.auth.signInWithGoogle();
  }
}
