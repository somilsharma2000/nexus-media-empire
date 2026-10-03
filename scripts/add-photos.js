const fs = require('fs');
const path = require('path');

const articlesPath = path.join(__dirname, '..', 'data', 'articles.json');
const raw = fs.readFileSync(articlesPath, 'utf-8');
const articles = JSON.parse(raw);

// Curated high-res Unsplash photos mapped to tech, crypto, and finance themes
const photoLibrary = {
  news: [
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop", // AI agent / neural
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop", // abstract digital
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop", // matrix code
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1200&auto=format&fit=crop", // cybersecurity / servers
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop", // hardware circuit
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop", // workspace tech
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop", // office startup
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop", // team collaboration
  ],
  crypto: [
    "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=1200&auto=format&fit=crop", // bitcoin gold coin
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1200&auto=format&fit=crop", // 3D blockchain nodes
    "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?q=80&w=1200&auto=format&fit=crop", // crypto neon
    "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1200&auto=format&fit=crop", // ethereum / token
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop", // mobile security / hardware wallet
    "https://images.unsplash.com/photo-1642790106117-e829e14a795f?q=80&w=1200&auto=format&fit=crop", // crypto candlestick
  ],
  finance: [
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop", // stock trading screens
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop", // stock market bull
    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop", // money analytics / growth
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop", // charts on laptop
    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=1200&auto=format&fit=crop", // investment coins jar
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=1200&auto=format&fit=crop", // banknotes cash
  ]
};

const updatedArticles = articles.map((article, idx) => {
  const nichePhotos = photoLibrary[article.niche] || photoLibrary.news;
  const coverImage = nichePhotos[idx % nichePhotos.length];
  const inlineImage = nichePhotos[(idx + 2) % nichePhotos.length];

  // Insert a responsive markdown image into the content body if not already present
  let content = article.content;
  if (!content.includes('![')) {
    const parts = content.split('## 2. Core Architecture');
    if (parts.length === 2) {
      content = `${parts[0]}\n\n![${article.title} Strategic Overview](${inlineImage})\n*Figure 1.1: Structural architecture and verified implementation framework in 2026.*\n\n## 2. Core Architecture${parts[1]}`;
    } else {
      content += `\n\n![${article.title} In-Depth](${inlineImage})\n`;
    }
  }

  return {
    ...article,
    image: coverImage,
    inlineImage: inlineImage,
    content: content,
  };
});

fs.writeFileSync(articlesPath, JSON.stringify(updatedArticles, null, 2));
console.log(`Updated ${updatedArticles.length} articles with high-resolution photos and inline figures.`);
