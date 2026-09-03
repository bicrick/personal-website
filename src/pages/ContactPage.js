import React from 'react';
import './ContactPage.css';

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
    href: 'https://resume.bicrick.com/',
    value: 'resume.bicrick.com',
    external: true,
  },
];

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
              {item.value}
            </a>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function ContactPage() {
  return (
    <section className="page-section contact-page" aria-label="contact">
      <article className="contact-article">
        <header className="contact-header">
          <h1 className="contact-heading">contact</h1>
        </header>

        <p>Email is the fastest way to reach me.</p>

        <h2>/ write</h2>
        <ContactList items={WRITE} />

        <h2>/ elsewhere</h2>
        <ContactList items={ELSEWHERE} />
      </article>
    </section>
  );
}
