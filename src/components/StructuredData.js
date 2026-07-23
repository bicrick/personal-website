import React from 'react';
import { Helmet } from 'react-helmet-async';

function StructuredData() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Patrick Brown",
    "alternateName": "bicrick",
    "url": "https://bicrick.com",
    "image": "https://bicrick.com/about/headshot.jpg",
    "email": "mailto:patrickbrownai@gmail.com",
    "jobTitle": "Data Engineer",
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
      "https://x.com/patrickbbrown",
      "https://cursor.com/@bicrick",
      "https://bicrick.com/contact"
    ],
    "knowsAbout": [
      "Data Engineering",
      "Machine Learning Data Preparation",
      "ML Pipelines",
      "Analytics Dashboards",
      "Google Cloud Platform",
      "Amazon Web Services",
      "Artificial Intelligence",
      "Software Development",
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
