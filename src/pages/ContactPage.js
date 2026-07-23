import React from 'react';

export default function ContactPage() {
  return (
    <section className="page-section" aria-label="contact">
      <div className="page-section-inner">
        <h2 className="contact-heading">contact</h2>
        <div className="contact-content page-prose">
          <p>
            email:{' '}
            <a href="mailto:patrickbrownai@gmail.com">patrickbrownai@gmail.com</a>
          </p>
          <p>
            github:{' '}
            <a href="https://github.com/bicrick" target="_blank" rel="noopener noreferrer">bicrick</a>
          </p>
          <p>
            linkedin:{' '}
            <a href="https://www.linkedin.com/in/patrick-brown-470617195/" target="_blank" rel="noopener noreferrer">patrick-brown</a>
          </p>
          <p>
            x:{' '}
            <a href="https://x.com/patrickbbrown" target="_blank" rel="noopener noreferrer">patrickbbrown</a>
          </p>
          <p>
            cursor:{' '}
            <a href="https://cursor.com/@bicrick" target="_blank" rel="noopener noreferrer">@bicrick</a>
          </p>
          <p>
            resume:{' '}
            <a href="https://resume.bicrick.com/" target="_blank" rel="noopener noreferrer">resume.bicrick.com</a>
          </p>
        </div>
      </div>
    </section>
  );
}
