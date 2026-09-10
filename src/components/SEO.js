import React from 'react';
import { Helmet } from 'react-helmet-async';

function SEO({
  title = 'bicrick',
  description = 'Patrick Brown (bicrick) - Agent-first engineer specializing in machine learning. Currently at H-E-B. Austin, TX.',
  keywords = 'bicrick, Patrick Brown, Agent-First Engineer, AI, Agents, Machine Learning, GCP, AWS, Austin, HEB, UT Austin',
  author = 'Patrick Brown (bicrick)',
  url = 'https://bicrick.com',
  image = 'https://www.bicrick.com/og/home-1200x630.jpg',
  imageAlt = 'Patrick Brown, agent-first engineer',
  imageWidth = 1200,
  imageHeight = 630,
  type = 'website',
  ogTitle,
  seoTitle,
}) {
  const displayTitle = 'bicrick';
  const cardTitle = ogTitle || title;
  const searchTitle = seoTitle || cardTitle;

  return (
    <Helmet>
      <title>{displayTitle}</title>
      <meta name="title" content={searchTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={cardTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:width" content={String(imageWidth)} />
      <meta property="og:image:height" content={String(imageHeight)} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:site_name" content="bicrick" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={cardTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />
      <meta name="twitter:creator" content="@patrickbbrown" />
    </Helmet>
  );
}

export default SEO;
