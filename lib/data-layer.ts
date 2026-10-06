import fs from 'fs/promises';
import path from 'path';
import { getPrisma } from './prisma';

const DATA_DIR = path.join(process.cwd(), 'data');

export function isDatabaseConnected(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'));
}

// ─── 1. ARTICLES REPOSITORY ──────────────────────────────────────────────────
export async function getArticles() {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const dbArticles = await db.article.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (dbArticles && dbArticles.length > 0) {
        return dbArticles;
      }
    } catch (err) {
      console.warn('[DataLayer] DB query failed, using local vault:', err);
    }
  }

  // Fallback to JSON vault
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, 'articles.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveArticles(articles: any[]) {
  // 1. Always update local JSON
  try {
    await fs.writeFile(path.join(DATA_DIR, 'articles.json'), JSON.stringify(articles, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DataLayer] Failed to write articles.json:', err);
  }

  // 2. Persist to DB if connected
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      for (const a of articles.slice(0, 5)) {
        await db.article.upsert({
          where: { id: String(a.id) },
          update: {
            title: a.title || 'Untitled',
            category: a.niche || a.category || 'news',
            excerpt: a.excerpt || '',
            content: a.content || '',
            status: a.status || 'published',
            publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
          },
          create: {
            id: String(a.id),
            title: a.title || 'Untitled',
            category: a.niche || a.category || 'news',
            excerpt: a.excerpt || '',
            content: a.content || '',
            status: a.status || 'published',
            publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
          },
        });
      }
    } catch (dbErr) {
      console.warn('[DataLayer] DB article upsert warning:', dbErr);
    }
  }
}

// ─── 2. AD SLOTS REPOSITORY ──────────────────────────────────────────────────
export async function getAdSlots() {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const dbSlots = await db.adSlot.findMany({
        orderBy: { priority: 'asc' },
      });
      if (dbSlots && dbSlots.length > 0) return dbSlots;
    } catch (err) {
      console.warn('[DataLayer] DB adslots failed, using local vault:', err);
    }
  }

  try {
    const raw = await fs.readFile(path.join(DATA_DIR, 'adslots.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// ─── 3. CLICK LOGS REPOSITORY ────────────────────────────────────────────────
export async function logAffiliateClick(slug: string, targetUrl: string, site?: string) {
  try {
    const filePath = path.join(DATA_DIR, 'click_log.json');
    const raw = await fs.readFile(filePath, 'utf-8').catch(() => '[]');
    const clicks = JSON.parse(raw);
    clicks.unshift({
      slug,
      targetUrl,
      site: site || 'general',
      timestamp: new Date().toISOString(),
    });
    await fs.writeFile(filePath, JSON.stringify(clicks.slice(0, 500), null, 2));
  } catch (err) {
    console.error('[DataLayer] Failed to write click_log.json:', err);
  }

  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.clickLog.create({
        data: {
          slug,
          targetUrl,
          site: site || 'general',
        },
      });
    } catch (err) {
      console.warn('[DataLayer] DB clickLog insert warning:', err);
    }
  }
}
