import { useState, type FormEvent } from 'react';
import { siteUrl, supabase } from '../lib/supabase';
import { validEmail } from '../lib/waitlist';
import { Rooty } from './Rooty';

export type AuthMode = 'signup' | 'login' | 'forgot' | 'reset';

const TITLES: Record<AuthMode, string> = {
  signup: 'Create your parent account',
  login: 'Welcome back',
  forgot: 'Reset your password',
  reset: 'Choose a new password',
};

/** Parent sign-up, login and password reset. Children never see this screen. */
export function AuthScreen({ initialMode, onBack, onDone }: { initialMode: AuthMode; onBack: () => void; onDone?: () => void }) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  function go(m: AuthMode) {
    setMode(m);
    setError(null);
    setSent(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    if (mode !== 'reset' && !validEmail(email)) return setError('Please check your email address.');
    if ((mode === 'signup' || mode === 'reset') && password.length < 8) return setError('Please use at least 8 characters.');
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: `${siteUrl()}/` } });
        if (error) throw error;
        // With "Confirm email" on, there's no session until the parent clicks the link.
        if (!data.session) setSent(`We’ve sent a link to ${email.trim()}. Open it to confirm you’re a grown-up, then come back and log in.`);
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        onDone?.();
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${siteUrl()}/reset-password` });
        if (error) throw error;
        setSent(`If ${email.trim()} has a Rootling account, a reset link is on its way.`);
      } else {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        window.history.replaceState(null, '', '/');
        onDone?.();
      }
    } catch (err) {
      setError(friendly(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="screen auth">
      <div className="speech">
        <Rooty size={72} leaves={2} mood="cheer" />
        <div className="bubble">{mode === 'signup' ? 'Grown-ups only! Rootling accounts belong to parents.' : 'Hello again, grown-up!'}</div>
      </div>
      <h1>{TITLES[mode]}</h1>

      {sent ? (
        <div className="card">
          <p className="big-line" role="status">
            📬 {sent}
          </p>
          <button className="btn primary" onClick={() => go('login')}>
            Go to log in
          </button>
        </div>
      ) : (
        <form className="card form" onSubmit={submit} noValidate>
          {mode !== 'reset' && (
            <label>
              Email
              <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </label>
          )}
          {mode !== 'forgot' && (
            <label>
              {mode === 'reset' ? 'New password' : 'Password'}
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </label>
          )}
          {mode === 'signup' && (
            <p className="muted small">
              By creating an account you confirm you’re 18 or over and agree to our <a href="/terms">terms</a> and{' '}
              <a href="/privacy">privacy policy</a>.
            </p>
          )}
          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : { signup: 'Create account', login: 'Log in', forgot: 'Send reset link', reset: 'Save password' }[mode]}
          </button>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </form>
      )}

      <div className="auth-links">
        {mode === 'login' && (
          <>
            <button className="link" onClick={() => go('forgot')}>
              Forgot password?
            </button>
            <button className="link" onClick={() => go('signup')}>
              New here? Create an account
            </button>
          </>
        )}
        {mode === 'signup' && (
          <button className="link" onClick={() => go('login')}>
            Already have an account? Log in
          </button>
        )}
        {mode === 'forgot' && (
          <button className="link" onClick={() => go('login')}>
            Back to log in
          </button>
        )}
        <button className="btn ghost" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
}

function friendly(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/invalid login credentials/i.test(msg)) return 'That email and password don’t match. Try again, or reset your password.';
  if (/email not confirmed/i.test(msg)) return 'Please confirm your email first: open the link we sent you.';
  if (/already registered/i.test(msg)) return 'That email already has an account. Try logging in.';
  if (/rate limit/i.test(msg)) return 'Too many emails sent just now. Please wait a few minutes and try again.';
  if (/fetch|network/i.test(msg)) return 'You seem to be offline. Check your connection and try again.';
  return msg;
}
