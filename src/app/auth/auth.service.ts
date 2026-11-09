import { Injectable } from '@angular/core';
import { createAuthClient } from '@neondatabase/auth';
import { environment } from '../../environments/environment';

const client = createAuthClient(environment.neonAuthUrl);

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Une seule requête get-session à la fois : les appels simultanés (guard, intercepteur, pages)
  // partagent la même promesse, sinon le neon_auth_session_verifier est consommé plusieurs fois (400).
  private inflight?: ReturnType<typeof client.getSession>;

  private fetchSession() {
    if (!this.inflight) {
      this.inflight = client.getSession().finally(() => {
        this.inflight = undefined;
        this.cleanUrl();
      });
    }
    return this.inflight;
  }

  private cleanUrl() {
    const url = new URL(window.location.href);
    if (url.searchParams.has('neon_auth_session_verifier')) {
      url.searchParams.delete('neon_auth_session_verifier');
      window.history.replaceState({}, '', url.toString());
    }
  }

  signUp(email: string, password: string, name: string) {
    return client.signUp.email({ email, password, name });
  }

  signIn(email: string, password: string) {
    return client.signIn.email({ email, password });
  }

  signInWithGoogle() {
    return client.signIn.social({
      provider: 'google',
      callbackURL: window.location.origin + '/cards',
      newUserCallbackURL: window.location.origin + '/onboarding',
    });
  }

  async getJwt() {
    const { data } = await this.fetchSession();
    let token = data?.session?.token;

    if (token && this.isExpired(token)) {
      const res = await fetch(`${environment.neonAuthUrl}/token`, { credentials: 'include' });
      if (res.ok) token = (await res.json()).token ?? token;
    }
    return token;
  }

  private isExpired(jwt: string) {
    try {
      const { exp } = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return exp * 1000 < Date.now() + 30_000;
    } catch {
      return true;
    }
  }

  async getUser() {
    const { data } = await this.fetchSession();
    return data?.user ?? null;
  }

  async isLoggedIn() {
    const { data } = await this.fetchSession();
    return !!data?.user;
  }

  signOut() {
    this.inflight = undefined;
    return client.signOut();
  }
}
