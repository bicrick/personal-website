import React from 'react';

export default function ContactPage() {
  return (
    <section className="page-section" aria-label="contact">
      <div className="page-section-inner">
        <h2 className="contact-heading">contact</h2>
        <div className="contact-content">
          <p>
            email:{' '}
            <a href="mailto:patrickbrownai@gmail.com">patrickbrownai@gmail.com</a>
          </p>
        </div>
      </div>
    </section>
  );
}
