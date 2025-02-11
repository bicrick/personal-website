import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function PrivacyPolicy() {
  return (
    <>
      <div className="parallax-container">
        <div className="parallax-layer layer-1" style={{ backgroundImage: 'url("/Nature Landscapes Free Pixel Art/nature_1/1.png")' }} />
        <div className="parallax-layer layer-2" style={{ backgroundImage: 'url("/Nature Landscapes Free Pixel Art/nature_1/2.png")' }} />
        <div className="parallax-layer layer-3" style={{ backgroundImage: 'url("/Nature Landscapes Free Pixel Art/nature_1/3.png")' }} />
        <div className="parallax-layer layer-5" style={{ backgroundImage: 'url("/Nature Landscapes Free Pixel Art/nature_1/5.png")' }} />
        <div className="parallax-layer layer-6" style={{ backgroundImage: 'url("/Nature Landscapes Free Pixel Art/nature_1/6.png")' }} />
        <div className="parallax-layer layer-7" style={{ backgroundImage: 'url("/Nature Landscapes Free Pixel Art/nature_1/7.png")' }} />
        <div className="parallax-layer layer-8" style={{ backgroundImage: 'url("/Nature Landscapes Free Pixel Art/nature_1/8.png")' }} />
      </div>

      <div className="App">
        <div className="container">
          <div className="pixel-card">
            <h1 className="pixel-text section-title">Privacy Policy</h1>
            <p className="pixel-text privacy-date">Revised Jun. 3, 2019</p>

            <div className="privacy-content">
              <p className="pixel-text">
                This privacy policy has been compiled to better serve those who are concerned with how their 'Personally Identifiable Information' (PII) is being used online. PII, as described in US privacy law and information security, is information that can be used on its own or with other information to identify, contact, or locate a single person, or to identify an individual in context. Please read our privacy policy carefully to get a clear understanding of how we collect, use, protect or otherwise handle your PII.
              </p>

              <h2 className="pixel-text privacy-heading">What personal information do we collect from the people that visit our website or app(s)?</h2>
              <p className="pixel-text">We may request the names and/or email addresses of our users.</p>

              <h2 className="pixel-text privacy-heading">When do we collect information?</h2>
              <p className="pixel-text">The aforementioned information is collected from you when you fill out a form or enter information on our website or app(s).</p>

              <h2 className="pixel-text privacy-heading">How is your information used?</h2>
              <p className="pixel-text">We may use the aforementioned information to ask for feedback, ratings, and/or reviews of services or products, to answer a question or provide clarification about services or products, or to otherwise respond to user requests.</p>

              <h2 className="pixel-text privacy-heading">How do we protect your information?</h2>
              <p className="pixel-text">We conduct regular vulnerability scans. We never ask for sensitive information like credit card numbers or social security numbers. We use an SSL certificate to secure user connections to our website.</p>

              <h2 className="pixel-text privacy-heading">Do we use cookies?</h2>
              <p className="pixel-text">We do not use cookies at this time.</p>

              <h2 className="pixel-text privacy-heading">Third-party disclosure</h2>
              <p className="pixel-text">We do not sell, trade, or otherwise transfer to outside parties your PII. This does not include website hosting partners and other parties who assist us in operating our website or serving our users, so long as those parties agree to keep this information confidential. We may also release information when it's release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property or safety.</p>

              <h2 className="pixel-text privacy-heading">Third-party links</h2>
              <p className="pixel-text">Third-party sites linked on our website or app(s) have separate and independent privacy policies. We have no responsibility or liability for the content and activities of these linked sites. Nonetheless, we seek to protect the integrity of our site and welcome any feedback about these sites.</p>

              <h2 className="pixel-text privacy-heading">California Online Privacy Protection Act</h2>
              <p className="pixel-text">CalOPPA is the first state law in the nation to require commercial websites and online services to post a privacy policy. The law's reach stretches well beyond California to require any person or company in the United States (and conceivably the world) that operates websites collecting PII from California consumers to post a conspicuous privacy policy on its website stating exactly the information being collected and those individuals or companies with whom it is being shared. See more at: <a href="https://consumercal.org/about-cfc/cfc-education-foundation/california-online-privacy-protection-act-caloppa-3" target="_blank" rel="noopener noreferrer" className="privacy-link">https://consumercal.org/about-cfc/cfc-education-foundation/california-online-privacy-protection-act-caloppa-3</a>. According to CalOPPA, we agree to the following: (1) Users can visit our site anonymously. (2) Once this privacy policy is created, we will add a link to it including the word "Privacy" on our home page or, at a minimum, on the first significant page after entering our website.</p>

              <h2 className="pixel-text privacy-heading">Does this site allow third-party behavioral tracking?</h2>
              <p className="pixel-text">We do not allow third-party behavioral tracking.</p>

              <h2 className="pixel-text privacy-heading">COPPA (Children Online Privacy Protection Act)</h2>
              <p className="pixel-text">The Federal Trade Commission, United States' consumer protection agency, enforces the Children's Online Privacy Protection Act (COPPA) Rule, which spells out what operators of websites and online services must do to protect children's privacy and safety online. In accordance with COPPA, we do not specifically market to children under the age of 13 years old.</p>

              <h2 className="pixel-text privacy-heading">Fair Information Practices</h2>
              <p className="pixel-text">The Fair Information Practices Principles form the backbone of privacy law in the United States and the concepts they include have played a significant role in the development of data protection laws around the globe. Understanding the Fair Information Practice Principles and how they should be implemented is critical to comply with the various privacy laws that protect personal information. In order to comply with Fair Information Practices we will, should a data breach occur, notify all users via in-site notification within 7 business days.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PrivacyPolicy; 