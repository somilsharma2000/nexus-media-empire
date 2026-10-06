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
        return dbArticles.map((a: any) => ({
          ...a,
          niche: a.site || a.category,
        }));
      }
    } catch (err) {
      console.warn('[DataLayer] DB getArticles failed, using local vault:', err);
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

export async function getArticleById(id: string) {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const a = await db.article.findFirst({
        where: {
          OR: [{ id: String(id) }, { slug: String(id) }],
        },
      });
      if (a) {
        return {
          ...a,
          niche: a.site || a.category,
        };
      }
    } catch (err) {
      console.warn('[DataLayer] DB getArticleById failed:', err);
    }
  }

  const articles = await getArticles();
  return articles.find((a: any) => String(a.id) === String(id) || a.slug === id) || null;
}

export async function saveArticle(article: any) {
  const articles = await getArticles();
  const existingIdx = articles.findIndex((a: any) => String(a.id) === String(article.id));

  if (existingIdx !== -1) {
    articles[existingIdx] = { ...articles[existingIdx], ...article };
  } else {
    articles.unshift(article);
  }

  // Write to local JSON
  try {
    await fs.writeFile(path.join(DATA_DIR, 'articles.json'), JSON.stringify(articles, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DataLayer] Failed to write articles.json:', err);
  }

  // Persist to DB if connected
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const idStr = String(article.id);
      await db.article.upsert({
        where: { id: idStr },
        update: {
          title: article.title || 'Untitled',
          slug: article.slug || null,
          site: article.niche || article.category || 'news',
          category: article.category || article.niche || 'Technology',
          excerpt: article.excerpt || '',
          content: article.content || '',
          metaTitle: article.metaTitle || null,
          metaDescription: article.metaDescription || null,
          image: article.image || null,
          imagePrompt: article.imagePrompt || null,
          featured: Boolean(article.featured),
          status: article.status || 'draft',
          qaStatus: article.qaStatus || 'pending',
          qaVerdict: article.qaVerdict || undefined,
          source: article.source || null,
          viewCount: Number(article.viewCount) || 0,
          publishAt: article.publishAt ? new Date(article.publishAt) : null,
          publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
        },
        create: {
          id: idStr,
          title: article.title || 'Untitled',
          slug: article.slug || null,
          site: article.niche || article.category || 'news',
          category: article.category || article.niche || 'Technology',
          excerpt: article.excerpt || '',
          content: article.content || '',
          metaTitle: article.metaTitle || null,
          metaDescription: article.metaDescription || null,
          image: article.image || null,
          imagePrompt: article.imagePrompt || null,
          featured: Boolean(article.featured),
          status: article.status || 'draft',
          qaStatus: article.qaStatus || 'pending',
          qaVerdict: article.qaVerdict || undefined,
          source: article.source || null,
          viewCount: Number(article.viewCount) || 0,
          publishAt: article.publishAt ? new Date(article.publishAt) : null,
          publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
        },
      });
    } catch (dbErr) {
      console.warn('[DataLayer] DB saveArticle upsert error:', dbErr);
    }
  }

  return article;
}

export async function saveArticles(articles: any[]) {
  try {
    await fs.writeFile(path.join(DATA_DIR, 'articles.json'), JSON.stringify(articles, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DataLayer] Failed to write articles.json:', err);
  }

  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      for (const a of articles.slice(0, 10)) {
        await saveArticle(a);
      }
    } catch (dbErr) {
      console.warn('[DataLayer] DB batch articles error:', dbErr);
    }
  }
}

export async function incrementArticleViews(id: string) {
  const articles = await getArticles();
  const idx = articles.findIndex((a: any) => String(a.id) === String(id) || a.slug === id);
  let newViews = 1;

  if (idx !== -1) {
    articles[idx].viewCount = (articles[idx].viewCount || 0) + 1;
    newViews = articles[idx].viewCount;
    await fs.writeFile(path.join(DATA_DIR, 'articles.json'), JSON.stringify(articles, null, 2), 'utf-8').catch(() => {});
  }

  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.article.updateMany({
        where: { OR: [{ id: String(id) }, { slug: String(id) }] },
        data: { viewCount: { increment: 1 } },
      });
    } catch (err) {
      console.warn('[DataLayer] DB increment views error:', err);
    }
  }

  return newViews;
}

// ─── 2. PIPELINE STATE & LOGS REPOSITORY ─────────────────────────────────────
export async function getPipelineState() {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const states = await db.pipelineStepState.findMany();
      if (states && states.length > 0) {
        const stateMap: Record<string, any> = {};
        states.forEach((s: any) => {
          stateMap[s.step] = {
            status: s.status,
            consecutiveFailures: s.consecutiveFailures,
            lastRun: s.lastRun ? s.lastRun.toISOString() : null,
          };
        });
        return stateMap;
      }
    } catch (err) {
      console.warn('[DataLayer] DB getPipelineState failed:', err);
    }
  }

  try {
    const raw = await fs.readFile(path.join(DATA_DIR, 'pipeline_state.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {
      trend_scout: { status: 'active', consecutiveFailures: 0 },
      qa_review: { status: 'active', consecutiveFailures: 0 },
      publisher: { status: 'active', consecutiveFailures: 0 },
    };
  }
}

export async function updatePipelineState(state: Record<string, any>) {
  try {
    await fs.writeFile(path.join(DATA_DIR, 'pipeline_state.json'), JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DataLayer] Failed to write pipeline_state.json:', err);
  }

  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      for (const [step, data] of Object.entries(state)) {
        await db.pipelineStepState.upsert({
          where: { step },
          update: {
            status: data.status || 'active',
            consecutiveFailures: Number(data.consecutiveFailures) || 0,
            lastRun: data.lastRun ? new Date(data.lastRun) : null,
          },
          create: {
            step,
            status: data.status || 'active',
            consecutiveFailures: Number(data.consecutiveFailures) || 0,
            lastRun: data.lastRun ? new Date(data.lastRun) : null,
          },
        });
      }
    } catch (err) {
      console.warn('[DataLayer] DB updatePipelineState error:', err);
    }
  }
}

export async function getPipelineLogs(limit = 20) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, 'pipeline_log.json'), 'utf-8');
    const logs = JSON.parse(raw);
    return logs.slice(-limit).reverse();
  } catch {
    return [];
  }
}

export async function appendPipelineLog(entry: { step: string; status: string; detail: string; timestamp?: string }) {
  const logEntry = {
    timestamp: entry.timestamp || new Date().toISOString(),
    step: entry.step,
    status: entry.status,
    detail: entry.detail,
  };

  try {
    const raw = await fs.readFile(path.join(DATA_DIR, 'pipeline_log.json'), 'utf-8').catch(() => '[]');
    const logs = JSON.parse(raw);
    logs.push(logEntry);
    await fs.writeFile(path.join(DATA_DIR, 'pipeline_log.json'), JSON.stringify(logs.slice(-500), null, 2), 'utf-8');
  } catch (err) {
    console.error('[DataLayer] Failed to write pipeline_log.json:', err);
  }
}

// ─── 3. AD SLOTS REPOSITORY ──────────────────────────────────────────────────
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

export async function saveAdSlot(slot: any) {
  const slots = await getAdSlots();
  const idx = slots.findIndex((s: any) => s.id === slot.id);
  if (idx !== -1) {
    slots[idx] = { ...slots[idx], ...slot };
  } else {
    slots.push(slot);
  }

  try {
    await fs.writeFile(path.join(DATA_DIR, 'adslots.json'), JSON.stringify(slots, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DataLayer] Failed to write adslots.json:', err);
  }

  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.adSlot.upsert({
        where: { id: slot.id },
        update: {
          name: slot.name,
          siteTargeting: slot.siteTargeting || 'all',
          placement: slot.placement || 'midFeed',
          type: slot.type || 'house',
          adCode: slot.adCode || null,
          headline: slot.headline || null,
          description: slot.description || null,
          ctaUrl: slot.ctaUrl || null,
          weight: Number(slot.weight) || 1,
          isActive: Boolean(slot.isActive),
          requiresDisclosure: Boolean(slot.requiresDisclosure),
          frequencyCapPerUser: Number(slot.frequencyCapPerUser) || 0,
          priority: Number(slot.priority) || 1,
        },
        create: {
          id: slot.id,
          name: slot.name,
          siteTargeting: slot.siteTargeting || 'all',
          placement: slot.placement || 'midFeed',
          type: slot.type || 'house',
          adCode: slot.adCode || null,
          headline: slot.headline || null,
          description: slot.description || null,
          ctaUrl: slot.ctaUrl || null,
          weight: Number(slot.weight) || 1,
          isActive: Boolean(slot.isActive),
          requiresDisclosure: Boolean(slot.requiresDisclosure),
          frequencyCapPerUser: Number(slot.frequencyCapPerUser) || 0,
          priority: Number(slot.priority) || 1,
        },
      });
    } catch (err) {
      console.warn('[DataLayer] DB saveAdSlot error:', err);
    }
  }

  return slot;
}

export async function killswitchAllAdSlots() {
  const slots = await getAdSlots();
  const updated = slots.map((s: any) => ({ ...s, isActive: false }));

  try {
    await fs.writeFile(path.join(DATA_DIR, 'adslots.json'), JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DataLayer] Failed to write adslots.json on killswitch:', err);
  }

  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.adSlot.updateMany({ data: { isActive: false } });
    } catch (err) {
      console.warn('[DataLayer] DB killswitch error:', err);
    }
  }

  return updated;
}

// ─── 4. CLICK LOGS REPOSITORY ────────────────────────────────────────────────
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

// ─── 5. SETTINGS REPOSITORY ──────────────────────────────────────────────────
export async function getSettings(): Promise<Record<string, any>> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const dbSettings = await db.setting.findMany();
      if (dbSettings && dbSettings.length > 0) {
        const map: Record<string, any> = {};
        dbSettings.forEach((s: any) => { map[s.key] = s.value; });
        return map;
      }
    } catch (err) {
      console.warn('[DataLayer] DB getSettings error:', err);
    }
  }

  try {
    const raw = await fs.readFile(path.join(DATA_DIR, 'settings.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function saveSettings(settings: Record<string, any>) {
  try {
    await fs.writeFile(path.join(DATA_DIR, 'settings.json'), JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('[DataLayer] Failed to write settings.json:', err);
  }

  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      for (const [key, value] of Object.entries(settings)) {
        await db.setting.upsert({
          where: { key },
          update: { value: value as any },
          create: { key, value: value as any },
        });
      }
    } catch (err) {
      console.warn('[DataLayer] DB saveSettings error:', err);
    }
  }
}

// ─── 6. NEWSLETTER SUBSCRIBERS ───────────────────────────────────────────────
export async function getNewsletterSubscribers() {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const subs = await db.newsletterSubscriber.findMany({
        orderBy: { subscribedAt: 'desc' },
      });
      if (subs && subs.length > 0) return subs;
    } catch (err) {
      console.warn('[DataLayer] DB getNewsletterSubscribers error:', err);
    }
  }

  try {
    const raw = await fs.readFile(path.join(DATA_DIR, 'subscribers.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function addNewsletterSubscriber(email: string, niche = 'general') {
  const cleanEmail = email.trim().toLowerCase();
  const subs = await getNewsletterSubscribers();
  const exists = subs.some((s: any) => s.email.toLowerCase() === cleanEmail);

  if (!exists) {
    subs.unshift({ email: cleanEmail, niche, subscribedAt: new Date().toISOString() });
    await fs.writeFile(path.join(DATA_DIR, 'subscribers.json'), JSON.stringify(subs, null, 2), 'utf-8').catch(() => {});
  }

  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.newsletterSubscriber.upsert({
        where: { email: cleanEmail },
        update: { niche, status: 'active' },
        create: { email: cleanEmail, niche, status: 'active' },
      });
    } catch (err) {
      console.warn('[DataLayer] DB addNewsletterSubscriber error:', err);
    }
  }

  return { email: cleanEmail, niche };
}

// ─── 7. QA LOGS REPOSITORY ───────────────────────────────────────────────────
export async function saveQALog(qaData: {
  articleId: string;
  verdict: string;
  averageScore: number;
  scores?: any;
  rejectionReason?: string;
  revisionInstructions?: string;
  model?: string;
}) {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.qALog.create({
        data: {
          articleId: String(qaData.articleId),
          verdict: qaData.verdict,
          averageScore: Number(qaData.averageScore) || 0,
          factualSoundness: qaData.scores?.factualSoundness ? Number(qaData.scores.factualSoundness) : null,
          originality: qaData.scores?.originality ? Number(qaData.scores.originality) : null,
          readability: qaData.scores?.readability ? Number(qaData.scores.readability) : null,
          seoStructure: qaData.scores?.seoStructure ? Number(qaData.scores.seoStructure) : null,
          rejectionReason: qaData.rejectionReason || null,
          revisionInstructions: qaData.revisionInstructions || null,
          model: qaData.model || 'gpt-4o-mini',
        },
      });
    } catch (err) {
      console.warn('[DataLayer] DB saveQALog error:', err);
    }
  }
}
