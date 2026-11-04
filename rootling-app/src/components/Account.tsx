import { useState } from 'react';
import { getCourse } from '../data/courses';
import { callApi, exportFamilyData, hasFullAccess, type Subscription } from '../lib/cloud';
import { MAX_CHILDREN, type ChildRecord } from '../lib/family';

interface Props {
  kids: ChildRecord[];
  activeId: string;
  onSwitch: (id: string) => void;
  onAdd: () => void;
  /** Null when using Rootling without an account. */
  account: {
    email: string | undefined;
    subscription: Subscription | null;
    online: boolean;
    pending: number;
    onLogout: () => void;
    onDeleted: () => void;
  } | null;
}

/** The parents area's family, plan and account sections. Only reachable behind the grown-ups check. */
export function AccountPanel({ kids, activeId, onSwitch, onAdd, account }: Props) {
  return (
    <>
      <section className="card">
        <h2>Your family</h2>
        <ul className="family-list">
          {kids.map((c) => (
            <li key={c.id}>
              <span>
                <strong>{c.progress.child!.name}</strong> <small className="muted">age {c.progress.child!.age} · {getCourse(c.progress.courseCode!).name}</small>
              </span>
              {c.id === activeId ? (
                <span className="chip">Playing now</span>
              ) : (
                <button className="btn ghost small" onClick={() => onSwitch(c.id)}>
                  Switch to {c.progress.child!.name}
                </button>
              )}
            </li>
          ))}
        </ul>
        {kids.length < MAX_CHILDREN ? (
          <button className="btn ghost" onClick={onAdd}>
            ＋ Add a child
          </button>
        ) : (
          <p className="muted small">A family can have up to {MAX_CHILDREN} children.</p>
        )}
      </section>

      {account ? <Plan subscription={account.subscription} /> : null}
      {account ? (
        <AccountSection {...account} />
      ) : (
        <section className="card">
          <h2>Saved on this device</h2>
          <p className="muted">Progress is kept on this device only. Parent accounts, syncing across devices and the Sprout plan are coming soon.</p>
        </section>
      )}
    </>
  );
}

function Plan({ subscription }: { subscription: Subscription | null }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const full = hasFullAccess(subscription);

  async function open(path: string) {
    setBusy(true);
    setError(null);
    try {
      const { url } = await callApi<{ url: string }>(path);
      window.location.assign(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long' }) : '');
  let summary = 'Seedling (free): the first unit of every language.';
  if (subscription?.status === 'trialing') summary = `Sprout plan, free month until ${date(subscription.trial_end)}.`;
  else if (subscription?.status === 'active') summary = `Sprout plan, $19/month. Renews ${date(subscription.current_period_end)}.`;
  else if (subscription?.status === 'past_due') summary = 'Sprout plan: your last payment didn’t go through. Please update your card.';
  if (full && subscription?.cancel_at_period_end) summary += ` Cancelled: ends ${date(subscription.current_period_end ?? subscription.trial_end)}.`;

  return (
    <section className="card">
      <h2>Your plan</h2>
      <p>{summary}</p>
      {full || subscription?.status === 'canceled' ? (
        <button className="btn ghost" disabled={busy} onClick={() => open('/api/create-portal-session')}>
          {full ? 'Manage subscription' : 'See past invoices'}
        </button>
      ) : null}
      {!full && (
        <>
          <p className="muted small">Sprout unlocks every lesson in every language for up to 4 children. $19/month{subscription?.status === 'canceled' ? '' : ', first month free'}. Cancel any time.</p>
          <button className="btn primary" disabled={busy} onClick={() => open('/api/create-checkout-session')}>
            {busy ? 'Opening…' : subscription?.status === 'canceled' ? 'Rejoin Sprout' : 'Start your free month'}
          </button>
        </>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

function AccountSection({ email, online, pending, onLogout, onDeleted }: NonNullable<Props['account']>) {
  const [confirm, setConfirm] = useState('');
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    setError(null);
    try {
      const blob = await exportFamilyData(email);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `rootling-family-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setError('Couldn’t download your data. Check your connection and try again.');
    }
  }

  async function deleteAccount() {
    setBusy(true);
    setError(null);
    try {
      await callApi('/api/delete-account');
      onDeleted();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h2>Account</h2>
      <p className="muted">
        Signed in as <strong>{email}</strong>.{' '}
        {online ? (pending > 0 ? 'Saving changes…' : 'Progress is saved to your account.') : 'Offline: progress is saved on this device and will sync when you’re back online.'}
      </p>
      <div className="row wrap">
        <button className="btn ghost" onClick={download} disabled={!online}>
          Download our data
        </button>
        <button className="btn ghost" onClick={onLogout}>
          Log out
        </button>
      </div>
      {asking ? (
        <div className="danger-zone">
          <p>
            This permanently deletes your account, every child profile and all progress, and cancels any subscription straight away. Type{' '}
            <strong>DELETE</strong> to confirm.
          </p>
          <label className="sr-only" htmlFor="confirm-delete">
            Type DELETE to confirm
          </label>
          <input id="confirm-delete" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
          <div className="row">
            <button className="btn danger" disabled={confirm !== 'DELETE' || busy || !online} onClick={deleteAccount}>
              {busy ? 'Deleting…' : 'Delete everything'}
            </button>
            <button className="btn ghost" onClick={() => setAsking(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className="link danger-link" onClick={() => setAsking(true)}>
          Delete our account and all data
        </button>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
