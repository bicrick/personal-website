import React from 'react';
import { Helmet } from 'react-helmet-async';

function SEO({ 
  title = "bicrick",
  description = "Patrick Brown (bicrick) - Data Engineer at H-E-B building ETL pipelines and data infrastructure. Software developer working in Austin, TX.",
  keywords = "bicrick, Patrick Brown, Data Engineer, Software Developer, Austin, HEB, UT Austin, AI, Machine Learning",
  author = "Patrick Brown (bicrick)",
  url = "https://bicrick.com",
  image = "https://bicrick.com/casual_logo.png",
  type = "website",
  ogTitle
}) {
  // Always use "bicrick" for visible title, but allow custom Open Graph title for SEO
  const displayTitle = "bicrick";
  const seoTitle = ogTitle || title;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{displayTitle}</title>
      <meta name="title" content={seoTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="bicrick" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@patrickbbrown" />
    </Helmet>
  );
}

export default SEO;
