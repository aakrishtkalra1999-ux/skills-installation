import { useState } from 'react';
import { getCourse } from '../data/courses';
import { MAX_CHILDREN, type ChildRecord } from '../lib/family';
import { ConsentCard } from './Onboarding';
import { Rooty } from './Rooty';

/** After sign-up, the parent agrees once before adding any child. */
export function ParentConsent({ onAgree, onLogout }: { onAgree: () => Promise<void>; onLogout: () => void }) {
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="screen onboarding">
      <div className="speech">
        <Rooty size={84} leaves={1} mood="cheer" />
        <div className="bubble">Hi! I’m Rooty. Before we meet your child, a quick word for grown-ups.</div>
      </div>
      <ConsentCard consent={consent} onChange={setConsent} onDevice={false} />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <footer className="footer">
        <button className="btn ghost" onClick={onLogout}>
          Log out
        </button>
        <button
          className="btn primary"
          disabled={!consent || busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              await onAgree();
            } catch {
              setError('That didn’t save. Check your connection and try again.');
            } finally {
              setBusy(false);
            }
          }}
        >
          Continue
        </button>
      </footer>
    </div>
  );
}

/** "Who's playing?": each child has their own path, leaves and stories. */
export function ChildPicker({
  kids,
  onPick,
  onAdd,
}: {
  kids: ChildRecord[];
  onPick: (id: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="screen center picker">
      <h1>Who’s playing?</h1>
      <div className="picker-grid">
        {kids.map((c) => {
          const p = c.progress;
          const leaves = (p.learned[p.courseCode!] ?? []).length;
          return (
            <button key={c.id} className="picker-card" onClick={() => onPick(c.id)}>
              <Rooty size={80} leaves={leaves} />
              <strong>{p.child!.name}</strong>
              <small>{getCourse(p.courseCode!).nativeName}</small>
            </button>
          );
        })}
      </div>
      {kids.length < MAX_CHILDREN && (
        <button className="btn ghost" onClick={onAdd}>
          ＋ Add a child
        </button>
      )}
    </div>
  );
}

/** Offers to bring over a child who played on this device before parent accounts existed. */
export function ImportOffer({ name, onImport, onSkip }: { name: string; onImport: () => void; onSkip: () => void }) {
  return (
    <div className="screen center">
      <Rooty size={120} leaves={5} mood="cheer" />
      <h1>Bring {name}’s progress?</h1>
      <p className="big-line">
        {name} already played Rootling on this device. Add {name} to your account to keep every leaf, lesson and milestone, on all your
        devices.
      </p>
      <div className="row">
        <button className="btn primary" onClick={onImport}>
          Yes, add {name}
        </button>
        <button className="btn ghost" onClick={onSkip}>
          Start fresh
        </button>
      </div>
    </div>
  );
}
