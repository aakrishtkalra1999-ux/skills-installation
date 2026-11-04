import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AccountPanel } from './components/Account';
import { AuthScreen, type AuthMode } from './components/Auth';
import { ChildPicker, ImportOffer, ParentConsent } from './components/Family';
import { Home } from './components/Home';
import { Landing } from './components/Landing';
import { NotFound, OfflineBanner, PrivacyPage, TermsPage } from './components/Legal';
import { LessonPlayer } from './components/LessonPlayer';
import { Onboarding } from './components/Onboarding';
import { ParentDashboard, ParentGate } from './components/Parents';
import { Rooty } from './components/Rooty';
import { StoryList, StoryReader } from './components/Stories';
import { getCourse } from './data/courses';
import type { Lesson, Story } from './data/types';
import { deleteChildRemote, hasFullAccess, loadProfile, loadSubscription, pullChildren, pushChild, recordConsent } from './lib/cloud';
import {
  activeChild,
  addChild,
  clearFamily,
  emptyFamily,
  importLegacy,
  legacyChild,
  loadFamily,
  reconcile,
  removeChild,
  saveFamily,
  storageKey,
  updateChild,
  type Family,
  type NewChild,
} from './lib/family';
import { elderFor } from './lib/personalise';
import { clearLegacyProgress, completeLesson, completeStory, MILESTONES, type MilestoneId, type Progress } from './lib/progress';
import { onVoicesReady } from './lib/speech';
import { cloudEnabled, supabase } from './lib/supabase';
import { useAuth, useOnline } from './lib/useAuth';

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  useEffect(() => {
    document.title = { '/privacy': 'Privacy policy · Rootling', '/terms': 'Terms · Rootling' }[path] ?? 'Rootling: little roots, big words';
  }, [path]);
  if (path === '/privacy') return <PrivacyPage />;
  if (path === '/terms') return <TermsPage />;
  if (path !== '/' && path !== '/reset-password' && path !== '/index.html') return <NotFound />;
  return <Main />;
}

function Splash({ text }: { text: string }) {
  return (
    <div className="screen center" aria-busy="true">
      <Rooty size={110} leaves={3} mood="think" />
      <p className="big-line">{text}</p>
    </div>
  );
}

/** Holds the family saved on this device for the current parent (or for the device, without accounts). */
function useFamily(key: string | null) {
  const [store, setStore] = useState<{ key: string | null; family: Family }>(() => ({ key, family: key ? loadFamily(key) : emptyFamily }));
  if (store.key !== key) {
    // Switching account: load that parent's saved family straight away, during render, to avoid a flash.
    const next = { key, family: key ? loadFamily(key) : emptyFamily };
    setStore(next);
    return [next.family, () => {}] as const;
  }
  const setFamily = (update: (f: Family) => Family) =>
    setStore((s) => (s.key === key ? { key, family: update(s.family) } : s));
  return [store.family, setFamily] as const;
}

function Main() {
  const auth = useAuth();
  const online = useOnline();
  const userId = auth.session?.user.id ?? null;
  const key = cloudEnabled ? (userId ? storageKey(userId) : null) : storageKey(null);
  const [family, setFamily] = useFamily(key);
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);
  const [started, setStarted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [pulled, setPulled] = useState(false);
  const [accountChecked, setAccountChecked] = useState(false);
  const [legacySkipped, setLegacySkipped] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [legacy] = useState(() => legacyChild());

  useEffect(() => {
    if (key) saveFamily(key, family);
  }, [key, family]);

  // Without accounts, a child who played before families existed simply carries on.
  useEffect(() => {
    if (cloudEnabled || !legacy) return;
    setFamily((f) => (f.children.length ? f : { ...importLegacy(f, new Date()), consentAt: new Date().toISOString() }));
    clearLegacyProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Cloud sync: save on the device first, then upload in the background.
  const familyRef = useRef(family);
  familyRef.current = family;
  const flushing = useRef(false);
  const again = useRef(false);

  const flush = useCallback(async () => {
    if (!userId || !navigator.onLine) return;
    if (flushing.current) {
      again.current = true;
      return;
    }
    flushing.current = true;
    try {
      const f = familyRef.current;
      for (const id of f.deleted) {
        await deleteChildRemote(id);
        setFamily((cur) => ({ ...cur, deleted: cur.deleted.filter((d) => d !== id) }));
      }
      for (const id of f.pending) {
        const sent = f.children.find((c) => c.id === id);
        if (!sent) continue;
        await pushChild(userId, sent);
        setFamily((cur) => {
          const now = cur.children.find((c) => c.id === id);
          return {
            ...cur,
            children: cur.children.map((c) => (c.id === id ? { ...c, synced: true } : c)),
            // Changed again while uploading? Keep it pending for the next round.
            pending: now && now.updatedAt === sent.updatedAt ? cur.pending.filter((p) => p !== id) : cur.pending,
          };
        });
      }
    } catch (e) {
      console.warn('Rootling sync will retry', e);
    } finally {
      flushing.current = false;
      if (again.current) {
        again.current = false;
        setTimeout(() => void flush(), 500);
      }
    }
  }, [userId, setFamily]);

  const dirty = family.pending.length + family.deleted.length;
  useEffect(() => {
    if (!userId || !pulled || dirty === 0) return;
    const t = setTimeout(() => void flush(), 1200);
    return () => clearTimeout(t);
  }, [userId, pulled, dirty, family, flush]);

  useEffect(() => {
    if (online && userId && pulled) void flush();
  }, [online, userId, pulled, flush]);

  const pull = useCallback(async () => {
    if (!userId) return;
    try {
      const remote = await pullChildren();
      setFamily((cur) => reconcile(cur, remote).family);
    } catch (e) {
      console.warn('Rootling could not load the family from the cloud', e);
    } finally {
      setPulled(true);
    }
  }, [userId, setFamily]);

  const refreshAccount = useCallback(async () => {
    if (!userId) return;
    try {
      const [profile, plan] = await Promise.all([loadProfile(userId), loadSubscription()]);
      setFamily((f) => ({ ...f, consentAt: profile?.consent_at ?? null, plan }));
    } catch (e) {
      console.warn('Rootling could not load the account', e);
    } finally {
      setAccountChecked(true);
    }
  }, [userId, setFamily]);

  useEffect(() => {
    setPulled(!userId);
    setAccountChecked(!userId);
    if (!userId) return;
    void pull();
    void refreshAccount();
    // Pick up changes made on another device when the app comes back to the front.
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        void pull();
        void refreshAccount();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [userId, pull, refreshAccount]);

  // Back from Stripe Checkout: the webhook can take a few seconds, so check a few times.
  useEffect(() => {
    if (!userId) return;
    const params = new URLSearchParams(window.location.search);
    const result = params.get('checkout');
    if (!result) return;
    window.history.replaceState(null, '', '/');
    if (result !== 'success') return;
    setNotice('Setting up your Sprout plan…');
    let tries = 0;
    const timer = setInterval(async () => {
      tries++;
      const plan = await loadSubscription().catch(() => null);
      if (hasFullAccess(plan) || tries >= 10) {
        clearInterval(timer);
        if (plan) setFamily((f) => ({ ...f, plan }));
        setNotice(hasFullAccess(plan) ? '🌱 Welcome to Sprout! Every lesson is open.' : 'Payment received. Your plan will update in a minute.');
        setTimeout(() => setNotice(null), 6000);
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [userId, setFamily]);

  async function logout() {
    await flush();
    if (familyRef.current.pending.length && !window.confirm('Some progress hasn’t been saved to your account yet. Log out anyway?')) return;
    if (key) clearFamily(key);
    await supabase?.auth.signOut();
    setAuthMode(null);
  }

  // ---------------------------------------------------------------- screens
  if (!auth.ready) return <Splash text="Loading…" />;

  if (cloudEnabled && auth.recovery) {
    return auth.session ? (
      <AuthScreen initialMode="reset" onBack={() => auth.clearRecovery()} onDone={() => auth.clearRecovery()} />
    ) : (
      <Splash text="Opening your reset link…" />
    );
  }

  if (cloudEnabled && !auth.session) {
    if (authMode) return <AuthScreen key={authMode} initialMode={authMode} onBack={() => setAuthMode(null)} />;
    return <Landing accounts onStart={() => setAuthMode('signup')} onLogin={() => setAuthMode('login')} legacyName={legacy?.child.name} />;
  }

  if (!cloudEnabled && family.children.length === 0 && !started) {
    return <Landing accounts={false} onStart={() => setStarted(true)} onLogin={() => {}} />;
  }

  if (cloudEnabled && !family.consentAt) {
    if (!accountChecked) return <Splash text="Loading your family…" />;
    return (
      <ParentConsent
        onLogout={logout}
        onAgree={async () => {
          const at = await recordConsent(userId!);
          setFamily((f) => ({ ...f, consentAt: at }));
        }}
      />
    );
  }

  if (cloudEnabled && family.children.length === 0 && !pulled) return <Splash text="Loading your family…" />;

  const onNewChild = (c: NewChild) => {
    setFamily((f) => ({ ...addChild(f, c, new Date()), consentAt: f.consentAt ?? new Date().toISOString() }));
    setAdding(false);
  };

  if (family.children.length === 0 || adding) {
    if (cloudEnabled && legacy && !legacySkipped && family.children.length === 0) {
      return (
        <ImportOffer
          name={legacy.child.name}
          onImport={() => {
            setFamily((f) => importLegacy(f, new Date()));
            clearLegacyProgress();
          }}
          onSkip={() => setLegacySkipped(true)}
        />
      );
    }
    return (
      <Onboarding
        withConsent={!cloudEnabled && !family.consentAt}
        onCancel={family.children.length > 0 ? () => setAdding(false) : !cloudEnabled ? () => setStarted(false) : undefined}
        onDone={({ courseCode, child, elderId }) => onNewChild({ courseCode, child, elderId })}
      />
    );
  }

  const current = activeChild(family);
  if (!current) {
    return (
      <ChildPicker
        kids={family.children}
        onPick={(id) => setFamily((f) => ({ ...f, activeChildId: id }))}
        onAdd={() => setAdding(true)}
      />
    );
  }

  return (
    <>
      {!online && <OfflineBanner />}
      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}
      <ChildApp
        key={current.id}
        progress={current.progress}
        setProgress={(p) => setFamily((f) => updateChild(f, current.id, p, new Date()))}
        paywall={cloudEnabled && !hasFullAccess(family.plan)}
        onSwitchChild={family.children.length > 1 ? () => setFamily((f) => ({ ...f, activeChildId: null })) : undefined}
        onRemoveChild={() => setFamily((f) => removeChild(f, current.id))}
        resetScope={cloudEnabled ? 'account' : 'device'}
        accountPanel={
          <AccountPanel
            kids={family.children}
            activeId={current.id}
            onSwitch={(id) => setFamily((f) => ({ ...f, activeChildId: id }))}
            onAdd={() => setAdding(true)}
            account={
              cloudEnabled
                ? {
                    email: auth.session?.user.email,
                    subscription: family.plan,
                    online,
                    pending: dirty,
                    onLogout: logout,
                    onDeleted: async () => {
                      if (key) clearFamily(key);
                      await supabase?.auth.signOut();
                    },
                  }
                : null
            }
          />
        }
      />
    </>
  );
}

type Tab = 'learn' | 'stories' | 'parents';
type View =
  | { name: 'tabs' }
  | { name: 'lesson'; lesson: Lesson }
  | { name: 'story'; story: Story }
  | { name: 'reward'; newWords: string[]; earned: MilestoneId[]; leaves: number; title: string };

interface ChildAppProps {
  progress: Progress;
  setProgress: (p: Progress) => void;
  paywall: boolean;
  onSwitchChild?: () => void;
  onRemoveChild: () => void;
  resetScope: 'device' | 'account';
  accountPanel: ReactNode;
}

/** One child's Rootling: the lesson path, stories and the parents area. */
function ChildApp({ progress, setProgress, paywall, onSwitchChild, onRemoveChild, resetScope, accountPanel }: ChildAppProps) {
  const [tab, setTab] = useState<Tab>('learn');
  const [view, setView] = useState<View>({ name: 'tabs' });
  const [parentOk, setParentOk] = useState(false);
  const [, rerender] = useState(0);

  // Re-render once TTS voices load so speaker buttons and listening games appear.
  useEffect(() => onVoicesReady(() => rerender((n) => n + 1)), []);

  const course = getCourse(progress.courseCode!);
  const child = progress.child!;
  const elder = elderFor(course, progress.elderByCourse[course.code]);

  if (view.name === 'lesson') {
    return (
      <LessonPlayer
        key={view.lesson.id}
        course={course}
        lesson={view.lesson}
        childName={child.name}
        age={child.age}
        elderId={progress.elderByCourse[course.code]}
        showRoman={progress.showRoman}
        onQuit={() => setView({ name: 'tabs' })}
        onFinish={(result) => {
          const { progress: next, newWords, earned } = completeLesson(progress, result, new Date());
          setProgress(next);
          setView({ name: 'reward', newWords, earned, leaves: (next.learned[course.code] ?? []).length, title: 'Lesson done!' });
        }}
      />
    );
  }

  if (view.name === 'story') {
    return (
      <StoryReader
        course={course}
        story={view.story}
        progress={progress}
        onClose={() => setView({ name: 'tabs' })}
        onDone={(seconds) => {
          const { progress: next, earned } = completeStory(progress, view.story.id, seconds, new Date());
          setProgress(next);
          setView({ name: 'reward', newWords: [], earned, leaves: (next.learned[course.code] ?? []).length, title: 'The end!' });
        }}
      />
    );
  }

  if (view.name === 'reward') {
    const grown = view.newWords.length;
    return (
      <div className="screen center reward">
        <Rooty size={150} leaves={view.leaves} mood="cheer" />
        <h1>{view.title}</h1>
        {grown > 0 ? (
          <p className="big-line">
            Rooty grew <strong>{grown}</strong> new {grown === 1 ? 'leaf' : 'leaves'}!
          </p>
        ) : (
          <p className="big-line">Well done, {child.name}!</p>
        )}
        {view.earned.length > 0 && (
          <ul className="earned">
            {view.earned.map((id) => (
              <li key={id}>🌟 {MILESTONES.find((m) => m.id === id)!.label.replaceAll('{gp}', elder.roman)}</li>
            ))}
          </ul>
        )}
        <button className="btn primary" onClick={() => setView({ name: 'tabs' })}>
          Keep going
        </button>
      </div>
    );
  }

  return (
    <>
      {tab === 'learn' && (
        <Home progress={progress} paywall={paywall} onSwitchChild={onSwitchChild} onStart={(lesson) => setView({ name: 'lesson', lesson })} />
      )}
      {tab === 'stories' && <StoryList course={course} progress={progress} onOpen={(story) => setView({ name: 'story', story })} />}
      {tab === 'parents' &&
        (parentOk ? (
          <ParentDashboard
            progress={progress}
            resetScope={resetScope}
            onToggleRoman={() => setProgress({ ...progress, showRoman: !progress.showRoman })}
            onSwitchCourse={(code) => setProgress({ ...progress, courseCode: code })}
            onSetElder={(code, id) => setProgress({ ...progress, elderByCourse: { ...progress.elderByCourse, [code]: id } })}
            onReset={onRemoveChild}
            extra={accountPanel}
          />
        ) : (
          <ParentGate onPass={() => setParentOk(true)} onCancel={() => setTab('learn')} />
        ))}
      <nav className="tabbar" aria-label="Sections">
        {(
          [
            ['learn', '🌱', 'Learn'],
            ['stories', '📖', 'Stories'],
            ['parents', '👪', 'Parents'],
          ] as const
        ).map(([id, icon, label]) => (
          <button
            key={id}
            className={tab === id ? 'active' : ''}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => {
              setTab(id);
              if (id !== 'parents') setParentOk(false);
            }}
          >
            <span aria-hidden="true">{icon}</span>
            {label}
          </button>
        ))}
      </nav>
    </>
  );
}
