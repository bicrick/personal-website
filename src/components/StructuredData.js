import React from 'react';
import { Helmet } from 'react-helmet-async';

function StructuredData() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Patrick Brown",
    "alternateName": "bicrick",
    "url": "https://bicrick.com",
    "image": "https://www.bicrick.com/og/home-1200x630.jpg",
    "email": "mailto:patrickbrownai@gmail.com",
    "jobTitle": "Data Engineer II",
    "worksFor": {
      "@type": "Organization",
      "name": "H-E-B"
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Austin",
      "addressRegion": "TX",
      "addressCountry": "US"
    },
    "alumniOf": {
      "@type": "CollegeOrUniversity",
      "name": "University of Texas at Austin"
    },
    "sameAs": [
      "https://github.com/bicrick",
      "https://www.linkedin.com/in/patrick-brown-470617195/",
      "https://www.youtube.com/@bicrick-dev",
      "https://x.com/patrickbbrown",
      "https://cursor.com/@bicrick",
      "https://bicrick.com/contact"
    ],
    "knowsAbout": [
      "Data Engineering",
      "Reinforcement Learning",
      "Agent Evaluation",
      "Machine Learning",
      "ML Pipelines",
      "Google Cloud Platform",
      "Amazon Web Services",
      "Artificial Intelligence",
      "Python",
      "React"
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(personSchema)}
      </script>
    </Helmet>
  );
}

export default StructuredData;
