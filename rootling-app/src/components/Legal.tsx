import type { ReactNode } from 'react';
import { Rooty } from './Rooty';

/*
 * DRAFTS. Everything marked "Lawyer to review" must be checked by a lawyer (or a
 * COPPA safe-harbour service) before real families sign up. This is not legal advice.
 */

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="legal">
      <header className="site-nav">
        <a className="brand" href="/" aria-label="Rootling home">
          <Rooty size={36} leaves={3} />
          <span>Rootling</span>
        </a>
      </header>
      <main className="legal-body">
        <h1>{title}</h1>
        <p className="review-note">Draft: last updated November 2026. Sections marked “Lawyer to review” are not final.</p>
        {children}
        <p>
          <a href="/">← Back to Rootling</a>
        </p>
      </main>
    </div>
  );
}

const Review = () => <span className="review-tag">Lawyer to review</span>;

export function PrivacyPage() {
  return (
    <Page title="Privacy policy">
      <p>
        Rootling helps children aged 3–10 learn their family’s language. This page explains, in plain words for parents, what we collect,
        why, and what you can do about it.
      </p>

      <h2>Who Rootling is for</h2>
      <p>
        Accounts belong to parents and guardians aged 18 or over. Children never create accounts, and never type an email address or
        password. A parent adds each child and is responsible for them using Rootling. <Review />
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>About you (the parent):</strong> your email address, a password (stored only as a secure hash by our login provider), when
          you agreed to this policy, and, if you subscribe, your subscription status. Card details are handled by Stripe and never reach
          us.
        </li>
        <li>
          <strong>About each child:</strong> a first name (or nickname), age, chosen language, the family member they talk to in lessons
          (e.g. Paati), favourite topics, and their learning progress (words learned, lessons and stories finished, minutes per day,
          milestones).
        </li>
        <li>
          <strong>Waitlist:</strong> your email, the language you want and the country you live in.
        </li>
      </ul>
      <p>
        We do <strong>not</strong> collect surnames, photos, birthdays, addresses, precise location, contacts or voice recordings.
      </p>

      <h2>The microphone</h2>
      <p>
        “Tap and say it” uses your browser’s built-in speech recognition only while your child holds the Say it button. Rootling does not
        record or store audio, and only notices that something was said. Depending on the browser, the browser maker may process the
        speech to recognise it. <Review /> The “I said it!” button works without the microphone.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To personalise lessons and stories (your child’s name and chosen family member appear in them).</li>
        <li>To save progress so it carries on across your devices.</li>
        <li>To run your account and subscription, and to email you about your account.</li>
        <li>To email waitlist families when their language is ready.</li>
      </ul>
      <p>We never sell data, never show ads and never use children’s data for marketing or to train AI models.</p>

      <h2>Who else handles data</h2>
      <ul>
        <li>
          <strong>Supabase</strong>: our database and login provider, which stores account and progress data. <Review />
        </li>
        <li>
          <strong>Vercel</strong>: hosts the app.
        </li>
        <li>
          <strong>Stripe</strong>: takes subscription payments, on the parent’s side of the app only.
        </li>
      </ul>
      <p>There are no ads, analytics or third-party trackers in the parts of Rootling children use.</p>

      <h2>Your choices and rights</h2>
      <ul>
        <li>
          <strong>See and download:</strong> Parents area → Account → Download our data gives you everything we hold about your family.
        </li>
        <li>
          <strong>Correct:</strong> change a child’s details or settings in the parents area at any time.
        </li>
        <li>
          <strong>Delete:</strong> remove a single child, or delete your whole account and all data, from the parents area. Deletion is
          immediate and cancels any subscription.
        </li>
        <li>
          <strong>Withdraw consent:</strong> deleting your account withdraws consent and stops all processing.
        </li>
      </ul>
      <p>
        Under US law (COPPA) and the UK Children’s Code you have the right to review, delete and refuse further collection of your
        child’s information. <Review />
      </p>

      <h2>Keeping data safe and for how long</h2>
      <p>
        Data is encrypted in transit, and each family’s data is isolated so a parent can only ever see their own children. We keep data
        while your account is open and delete it when you delete the account. Waitlist emails are deleted once we’ve told you your
        language is ready, or when you ask. <Review />
      </p>

      <h2>Contact</h2>
      <p>
        Questions or requests: <a href="mailto:hello@rootling.app">hello@rootling.app</a> <Review />
      </p>
    </Page>
  );
}

export function TermsPage() {
  return (
    <Page title="Terms of use">
      <h2>The service</h2>
      <p>
        Rootling provides language lessons, games and stories for children, used under a parent’s supervision. Languages marked
        “preview” are still being checked by native speakers and may change.
      </p>
      <h2>Your account</h2>
      <p>
        You must be 18 or over and the parent or legal guardian of the children you add. Keep your password safe; you are responsible for
        activity on your account. <Review />
      </p>
      <h2>Plans and payment</h2>
      <ul>
        <li>The Seedling plan is free and includes the first unit of every language.</li>
        <li>
          The Sprout plan costs $19 per month for up to 4 children. New families get the first month free; you won’t be charged if you
          cancel before it ends.
        </li>
        <li>Cancel any time in Parents area → Your plan → Manage subscription. Access continues until the end of the paid period.</li>
        <li>
          Prices may change with at least 30 days’ notice by email. Refunds follow the law where you live. <Review />
        </li>
      </ul>
      <h2>Acceptable use</h2>
      <p>Please don’t copy, resell or try to break the service, or use it to collect information about other people.</p>
      <h2>Content</h2>
      <p>
        Lessons, stories, Rooty and the app are owned by Rootling. You may use them for your family’s personal learning. <Review />
      </p>
      <h2>Liability</h2>
      <p>
        We work hard to keep Rootling accurate and available but provide it “as is”. To the extent the law allows, our liability is
        limited to the amount you paid in the last 12 months. <Review />
      </p>
      <h2>Changes and contact</h2>
      <p>
        We’ll email you about important changes to these terms. Questions: <a href="mailto:hello@rootling.app">hello@rootling.app</a>{' '}
        <Review />
      </p>
    </Page>
  );
}

export function NotFound() {
  return (
    <div className="screen center">
      <Rooty size={120} leaves={1} mood="think" />
      <h1>Oops, this page didn’t grow</h1>
      <p className="big-line">We couldn’t find that page.</p>
      <a className="btn primary" href="/">
        Go to Rootling
      </a>
    </div>
  );
}

export function OfflineBanner() {
  return (
    <div className="offline" role="status">
      You’re offline. Lessons still work, and progress will save when you’re back online.
    </div>
  );
}
