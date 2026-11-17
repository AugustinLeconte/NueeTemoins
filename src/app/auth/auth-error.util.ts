export type AuthContext = 'login' | 'signup';

export interface NormalizedAuthError {
  /** Clé Transloco */
  key: string;
  /** Paramètres Transloco (ex: référence technique) */
  params?: Record<string, string | number>;
  /** Infos pour la console (jamais de mot de passe) */
  debug: { code?: string; status?: number; message?: string };
}

export function normalizeAuthError(err: unknown, context: AuthContext): NormalizedAuthError {
  const e = err as any;
  const rawCode = e?.code ?? e?.error?.code ?? e?.body?.code ?? e?.error_code;
  const code = rawCode ? String(rawCode).toUpperCase() : undefined;
  const status: number | undefined = e?.status ?? e?.statusCode ?? e?.error?.status;
  const message: string | undefined = e?.message ?? e?.error?.message;
  const debug = { code, status, message };
  const result = (key: string): NormalizedAuthError => ({ key, debug });

  // 1. Réseau
  const isNetwork =
    (e instanceof TypeError && /fetch|network/i.test(message ?? '')) ||
    status === 0 ||
    (typeof navigator !== 'undefined' && !navigator.onLine);
  if (isNetwork) return result('auth.errors.network');

  // 2. Par code (Better Auth / Neon Auth + style Supabase)
  switch (code) {
    case 'INVALID_EMAIL_OR_PASSWORD':
    case 'INVALID_CREDENTIALS':
    case 'INVALID_PASSWORD':
    case 'USER_NOT_FOUND':
      return result('auth.errors.invalidCredentials');

    // Compte créé avec Google, pas de mot de passe
    case 'CREDENTIAL_ACCOUNT_NOT_FOUND':
    case 'ACCOUNT_NOT_FOUND':
      return result('auth.errors.useGoogle');

    case 'EMAIL_NOT_VERIFIED':
    case 'EMAIL_NOT_CONFIRMED':
      return result('auth.errors.emailNotVerified');

    case 'USER_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
    case 'EMAIL_EXISTS':
    case 'USER_ALREADY_REGISTERED':
      return result('auth.errors.emailTaken');

    case 'PASSWORD_TOO_SHORT':
    case 'WEAK_PASSWORD':
      return result('auth.errors.passwordTooShort');
    case 'PASSWORD_TOO_LONG':
      return result('auth.errors.passwordTooLong');

    case 'INVALID_EMAIL':
    case 'EMAIL_ADDRESS_INVALID':
      return result('auth.errors.invalidEmail');

    case 'SIGNUP_DISABLED':
    case 'EMAIL_PASSWORD_SIGN_UP_DISABLED':
      return result('auth.errors.signupDisabled');

    case 'OVER_REQUEST_RATE_LIMIT':
    case 'OVER_EMAIL_SEND_RATE_LIMIT':
    case 'TOO_MANY_REQUESTS':
      return result('auth.errors.tooManyRequests');

    case 'SESSION_EXPIRED':
      return result('auth.errors.sessionExpired');
  }

  // 3. Par texte du message (si le code est absent ou inconnu)
  const msg = message ?? '';
  if (/invalid (email or password|credentials|login)/i.test(msg)) return result('auth.errors.invalidCredentials');
  if (/already (exists|registered|in use)/i.test(msg)) return result('auth.errors.emailTaken');
  if (/not (verified|confirmed)/i.test(msg)) return result('auth.errors.emailNotVerified');
  if (/password.*(short|least|weak)/i.test(msg)) return result('auth.errors.passwordTooShort');
  if (/too many|rate limit/i.test(msg)) return result('auth.errors.tooManyRequests');

  // 4. Par statut HTTP
  if (status === 429) return result('auth.errors.tooManyRequests');
  if (status === 401) return result('auth.errors.invalidCredentials');
  if (status === 403) return result('auth.errors.forbidden');
  if (status === 422 || status === 400) {
    return result(context === 'signup' ? 'auth.errors.invalidData' : 'auth.errors.invalidCredentials');
  }
  if (status && status >= 500) return result('auth.errors.server');

  // 5. Dernier recours : message générique + référence technique
  return {
    key: context === 'login' ? 'auth.errors.loginFailed' : 'auth.errors.signupFailed',
    params: { ref: code ?? status ?? 'unknown' },
    debug,
  };
}
