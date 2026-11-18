import React, { useState } from 'react';
import TypewriterHeading from '../components/TypewriterHeading';
import { RESUME_LABEL, RESUME_URL } from '../constants/resume';
import './ContactPage.css';
import './ContactPage.mobile.css';

const WRITE = [
  {
    label: 'email',
    href: 'mailto:patrickbrownai@gmail.com',
    value: 'patrickbrownai@gmail.com',
  },
];

const ELSEWHERE = [
  {
    label: 'github',
    href: 'https://github.com/bicrick',
    value: 'bicrick',
    external: true,
  },
  {
    label: 'linkedin',
    href: 'https://www.linkedin.com/in/patrick-brown-470617195/',
    value: 'patrick-brown',
    external: true,
  },
  {
    label: 'youtube',
    href: 'https://www.youtube.com/@bicrick-dev',
    value: '@bicrick-dev',
    external: true,
  },
  {
    label: 'x',
    href: 'https://x.com/patrickbbrown',
    value: 'patrickbbrown',
    external: true,
  },
  {
    label: 'cursor',
    href: 'https://cursor.com/@bicrick',
    value: '@bicrick',
    external: true,
  },
  {
    label: 'resume',
    href: RESUME_URL,
    value: RESUME_LABEL,
    short: 'resume.pdf',
    external: true,
  },
];

function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };
  return (
    <button type="button" className={`contact-copy${copied ? ' is-done' : ''}`} onClick={copy}>
      {copied ? 'copied ✓' : 'copy email'}
    </button>
  );
}

function ContactList({ items }) {
  return (
    <dl className="contact-list">
      {items.map((item) => (
        <div className="contact-row" key={item.label}>
          <dt>{item.label}</dt>
          <dd>
            <a
              href={item.href}
              {...(item.external
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            >
              <span className="contact-value-full">
                {typeof item.value === 'string'
                  ? item.value.split('/').flatMap((part, i) => (i ? [<wbr key={i} />, `/${part}`] : [part]))
                  : item.value}
              </span>
              {item.short && <span className="contact-value-short">{item.short}</span>}
            </a>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function ContactPage() {
  return (
    <section
      id="contact"
      className="page-section contact-page"
      aria-label="contact"
    >
      <article className="contact-article">
        <header className="contact-header">
          <TypewriterHeading as="h1" className="contact-heading">
            contact
          </TypewriterHeading>
        </header>

        <p>Email is the fastest way to reach me.</p>

        <h2>/ write</h2>
        <ContactList items={WRITE} />
        <CopyEmail email={WRITE[0].value} />

        <h2>/ elsewhere</h2>
        <ContactList items={ELSEWHERE} />
      </article>
    </section>
  );
}
