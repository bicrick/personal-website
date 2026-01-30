import React from 'react';
import { Helmet } from 'react-helmet-async';

function StructuredData() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Patrick Brown",
    "alternateName": "bicrick",
    "url": "https://bicrick.com",
    "image": "https://bicrick.com/casual_logo.png",
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
      "https://x.com/patrickbbrown"
    ],
    "knowsAbout": [
      "Data Engineering",
      "Software Development",
      "Artificial Intelligence",
      "Machine Learning",
      "ETL Pipelines",
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
