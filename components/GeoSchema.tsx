import React from "react";

interface GeoSchemaProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedTime: string;
  modifiedTime?: string;
  authorName?: string;
  niche: string;
  siteName: string;
}

export default function GeoSchema({
  title,
  description,
  url,
  imageUrl,
  publishedTime,
  modifiedTime,
  authorName = "Nexus Editorial Team",
  niche,
  siteName,
}: GeoSchemaProps) {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "NewsArticle",
        "@id": `${url}#article`,
        "isPartOf": {
          "@type": "WebPage",
          "@id": url,
          "url": url,
          "name": title,
          "description": description
        },
        "headline": title,
        "description": description,
        "image": imageUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200",
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": url
        },
        "author": {
          "@type": "Person",
          "name": authorName,
          "jobTitle": "Lead Industry Analyst",
          "worksFor": {
            "@type": "Organization",
            "name": siteName
          }
        },
        "publisher": {
          "@type": "Organization",
          "name": siteName,
          "logo": {
            "@type": "ImageObject",
            "url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200"
          }
        },
        "keywords": [
          niche === "news" ? "Artificial Intelligence" : niche === "crypto" ? "Cryptocurrency" : "Personal Finance",
          "Tech Analysis",
          "2026 Guide",
          "Educational Deep Dive"
        ],
        "articleSection": niche.toUpperCase(),
        "isAccessibleForFree": true,
        "inLanguage": "en-US",
        "potentialAction": {
          "@type": "ReadAction",
          "target": [url]
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://thetrendmatrix.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": niche.charAt(0).toUpperCase() + niche.slice(1),
            "item": `https://thetrendmatrix.com/${niche}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": title,
            "item": url
          }
        ]
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
