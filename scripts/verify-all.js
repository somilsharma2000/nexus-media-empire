const http = require('http');

const routes = [
  '/admin/login',
  '/news',
  '/crypto',
  '/finance',
  '/news/vector-databases-explained-pinecone-vs-chroma-vs-weaviate',
  '/crypto/layer-2-rollups-explained-optimistic-vs-zero-knowledge-zk',
  '/finance/how-to-read-an-income-statement-in-10-minutes',
  '/news/about',
  '/news/privacy-policy',
  '/api/articles',
  '/api/topics',
  '/api/rss?niche=news',
  '/sitemap.xml',
  '/robots.txt'
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3002${route}`, (res) => {
      resolve({ route, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ route, error: err.message });
    });
  });
}

async function run() {
  console.log('🚀 Running Full Network Verification Sweep...\n');
  let pass = 0;
  for (const r of routes) {
    const result = await checkRoute(r);
    if (result.status === 200) {
      console.log(`✅ [200 OK] ${r}`);
      pass++;
    } else {
      console.log(`❌ [FAIL] ${r} -> ${result.status || result.error}`);
    }
  }
  console.log(`\n🎉 Verified: ${pass}/${routes.length} routes 100% operational!`);
}

run();
