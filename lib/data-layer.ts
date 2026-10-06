import fs from 'fs/promises';
import path from 'path';
import { getPrisma } from './prisma';

const DATA_DIR = path.join(process.cwd(), 'data');

export function isDatabaseConnected(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'));
}

export function isProductionEnvironment(): boolean {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

async function safeReadJson<T>(filename: string, fallback: T): Promise<T> {
  if (isProductionEnvironment() && isDatabaseConnected()) {
    console.error(`[DataLayer Alert] Local file read attempted in production for ${filename}`);
  }
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function safeWriteJson(filename: string, data: any): Promise<void> {
  if (isProductionEnvironment() && isDatabaseConnected()) {
    console.error(`[DataLayer Alert] Local file write attempted in production for ${filename}`);
    return;
  }
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`[DataLayer] Local write fallback skipped for ${filename}:`, err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ARTICLES REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────
export async function getArticles(): Promise<any[]> {
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
      console.error('[DataLayer] DB getArticles error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  return await safeReadJson<any[]>('articles.json', []);
}

export async function getArticleById(id: string): Promise<any | null> {
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
      console.error('[DataLayer] DB getArticleById error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const articles = await getArticles();
  return articles.find((a: any) => String(a.id) === String(id) || a.slug === id) || null;
}

export async function searchArticles(query: string, niche?: string): Promise<any[]> {
  const allArticles = await getArticles();
  const q = (query || '').toLowerCase().trim();
  if (!q) return allArticles.slice(0, 10);

  return allArticles.filter((a: any) => {
    const matchesNiche = !niche || niche === 'all' || a.site === niche || a.niche === niche || a.category?.toLowerCase() === niche.toLowerCase();
    const matchesQuery = (a.title && a.title.toLowerCase().includes(q)) || (a.content && a.content.toLowerCase().includes(q)) || (a.excerpt && a.excerpt.toLowerCase().includes(q));
    return matchesNiche && matchesQuery;
  }).slice(0, 10);
}

export async function saveArticle(article: any): Promise<any> {
  const db = getPrisma();
  const idStr = String(article.id || `art-${Date.now()}`);
  const formatted = {
    ...article,
    id: idStr,
    site: article.site || article.niche || article.category || 'news',
    slug: (article.slug || article.title || idStr).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  };

  if (db && isDatabaseConnected()) {
    try {
      const saved = await db.article.upsert({
        where: { id: idStr },
        update: {
          title: formatted.title || 'Untitled',
          slug: formatted.slug,
          site: formatted.site,
          category: formatted.category || formatted.site,
          excerpt: formatted.excerpt || '',
          content: formatted.content || '',
          metaTitle: formatted.metaTitle || null,
          metaDescription: formatted.metaDescription || null,
          image: formatted.image || null,
          featured: Boolean(formatted.featured),
          status: formatted.status || 'draft',
          qaStatus: formatted.qaStatus || 'pending',
          qaVerdict: formatted.qaVerdict ? JSON.parse(JSON.stringify(formatted.qaVerdict)) : undefined,
          source: formatted.source || null,
          viewCount: typeof formatted.viewCount === 'number' ? formatted.viewCount : undefined,
          publishAt: formatted.publishAt ? new Date(formatted.publishAt) : undefined,
          publishedAt: formatted.publishedAt ? new Date(formatted.publishedAt) : undefined,
        },
        create: {
          id: idStr,
          title: formatted.title || 'Untitled',
          slug: formatted.slug,
          site: formatted.site,
          category: formatted.category || formatted.site,
          excerpt: formatted.excerpt || '',
          content: formatted.content || '',
          metaTitle: formatted.metaTitle || null,
          metaDescription: formatted.metaDescription || null,
          image: formatted.image || null,
          featured: Boolean(formatted.featured),
          status: formatted.status || 'draft',
          qaStatus: formatted.qaStatus || 'pending',
          qaVerdict: formatted.qaVerdict ? JSON.parse(JSON.stringify(formatted.qaVerdict)) : undefined,
          source: formatted.source || null,
          viewCount: typeof formatted.viewCount === 'number' ? formatted.viewCount : 0,
          publishAt: formatted.publishAt ? new Date(formatted.publishAt) : null,
          publishedAt: formatted.publishedAt ? new Date(formatted.publishedAt) : null,
          createdAt: formatted.createdAt ? new Date(formatted.createdAt) : new Date(),
        },
      });

      return {
        ...saved,
        niche: saved.site,
      };
    } catch (err) {
      console.error('[DataLayer] DB saveArticle error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const articles = await safeReadJson<any[]>('articles.json', []);
  const idx = articles.findIndex((a: any) => String(a.id) === idStr);
  if (idx >= 0) {
    articles[idx] = { ...articles[idx], ...formatted, updatedAt: new Date().toISOString() };
  } else {
    articles.unshift({ ...formatted, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  await safeWriteJson('articles.json', articles);
  return formatted;
}

export async function saveArticles(newArticles: any[]): Promise<any[]> {
  const results = [];
  for (const a of newArticles) {
    results.push(await saveArticle(a));
  }
  return results;
}

export async function incrementArticleView(id: string): Promise<number> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const updated = await db.article.update({
        where: { id: String(id) },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true },
      });
      return updated.viewCount;
    } catch (err) {
      console.error('[DataLayer] DB incrementArticleView error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const articles = await safeReadJson<any[]>('articles.json', []);
  const found = articles.find((a: any) => String(a.id) === String(id) || a.slug === id);
  if (found) {
    found.viewCount = (found.viewCount || 0) + 1;
    await safeWriteJson('articles.json', articles);
    return found.viewCount;
  }
  return 0;
}

export async function deleteArticle(id: string): Promise<boolean> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.article.delete({ where: { id: String(id) } });
      return true;
    } catch (err) {
      console.error('[DataLayer] DB deleteArticle error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  let articles = await safeReadJson<any[]>('articles.json', []);
  const initialLength = articles.length;
  articles = articles.filter((a: any) => String(a.id) !== String(id) && a.slug !== id);
  await safeWriteJson('articles.json', articles);
  return articles.length < initialLength;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TOPICS REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────
export async function getTopics(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const topics = await db.topic.findMany({
        orderBy: [{ priority: 'asc' }, { timesUsed: 'asc' }],
      });
      if (topics && topics.length > 0) return topics;
    } catch (err) {
      console.error('[DataLayer] DB getTopics error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  return await safeReadJson<any[]>('topics.json', []);
}

export async function saveTopic(topic: any): Promise<any> {
  const db = getPrisma();
  const idStr = String(topic.id || `top-${Date.now()}`);

  if (db && isDatabaseConnected()) {
    try {
      return await db.topic.upsert({
        where: { id: idStr },
        update: {
          topic: topic.topic,
          niche: topic.niche || 'news',
          priority: topic.priority || 'medium',
          isActive: topic.isActive !== false,
          timesUsed: typeof topic.timesUsed === 'number' ? topic.timesUsed : undefined,
          lastUsed: topic.lastUsed ? new Date(topic.lastUsed) : undefined,
        },
        create: {
          id: idStr,
          topic: topic.topic,
          niche: topic.niche || 'news',
          priority: topic.priority || 'medium',
          isActive: topic.isActive !== false,
          timesUsed: topic.timesUsed || 0,
          lastUsed: topic.lastUsed ? new Date(topic.lastUsed) : null,
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB saveTopic error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const topics = await safeReadJson<any[]>('topics.json', []);
  const idx = topics.findIndex((t: any) => String(t.id) === idStr);
  if (idx >= 0) {
    topics[idx] = { ...topics[idx], ...topic };
  } else {
    topics.push({ id: idStr, ...topic });
  }
  await safeWriteJson('topics.json', topics);
  return topic;
}

export async function deleteTopic(id: string): Promise<boolean> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.topic.delete({ where: { id: String(id) } });
      return true;
    } catch (err) {
      console.error('[DataLayer] DB deleteTopic error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  let topics = await safeReadJson<any[]>('topics.json', []);
  const initialLength = topics.length;
  topics = topics.filter((t: any) => String(t.id) !== String(id));
  await safeWriteJson('topics.json', topics);
  return topics.length < initialLength;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. QA REVIEWS & LOGS & CONFIG
// ─────────────────────────────────────────────────────────────────────────────
export async function getQALogs(limit = 50): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      return await db.qALog.findMany({
        orderBy: { reviewedAt: 'desc' },
        take: limit,
      });
    } catch (err) {
      console.error('[DataLayer] DB getQALogs error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return [];
}

export async function addQALog(entry: any): Promise<any> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      return await db.qALog.create({
        data: {
          articleId: String(entry.articleId),
          factualSoundness: entry.factualSoundness ?? entry.scores?.factualSoundness,
          originality: entry.originality ?? entry.scores?.originality,
          readability: entry.readability ?? entry.scores?.readability,
          seoStructure: entry.seoStructure ?? entry.scores?.seoStructure,
          averageScore: Number(entry.averageScore || 0),
          verdict: entry.verdict || 'APPROVE',
          rejectionReason: entry.rejectionReason || null,
          revisionInstructions: entry.revisionInstructions || null,
          model: entry.model || 'gpt-4o-mini',
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB addQALog error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return entry;
}

export const saveQALog = addQALog;

export async function getQAConfig(): Promise<any> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const row = await db.setting.findUnique({ where: { key: 'qa_config' } });
      if (row && row.value) return row.value;
    } catch (err) {
      console.error('[DataLayer] DB getQAConfig error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  return await safeReadJson<any>('qa_config.json', {
    approveThreshold: 8,
    reviseThreshold: 5,
    maxRevisionAttempts: 1,
    autoPublishApproved: true,
  });
}

export async function saveQAConfig(config: any): Promise<any> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.setting.upsert({
        where: { key: 'qa_config' },
        update: { value: JSON.parse(JSON.stringify(config)) },
        create: { key: 'qa_config', value: JSON.parse(JSON.stringify(config)) },
      });
      return config;
    } catch (err) {
      console.error('[DataLayer] DB saveQAConfig error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  await safeWriteJson('qa_config.json', config);
  return config;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PIPELINE STATE & LOGS & AUTOMATION CONFIG
// ─────────────────────────────────────────────────────────────────────────────
export async function getPipelineState(): Promise<Record<string, any>> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const steps = await db.pipelineStepState.findMany();
      if (steps && steps.length > 0) {
        const stateObj: Record<string, any> = {};
        for (const s of steps) {
          stateObj[s.step] = {
            status: s.status,
            consecutiveFailures: s.consecutiveFailures,
            lastRun: s.lastRun?.toISOString() || null,
          };
        }
        return stateObj;
      }
    } catch (err) {
      console.error('[DataLayer] DB getPipelineState error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  return await safeReadJson<Record<string, any>>('pipeline_state.json', {
    trend_scout: { status: 'active', consecutiveFailures: 0, lastRun: null },
    qa_review: { status: 'active', consecutiveFailures: 0, lastRun: null },
    publisher: { status: 'active', consecutiveFailures: 0, lastRun: null },
  });
}

export async function updatePipelineStepState(step: string, data: { status?: string; consecutiveFailures?: number; lastRun?: Date }): Promise<void> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.pipelineStepState.upsert({
        where: { step },
        update: {
          status: data.status,
          consecutiveFailures: data.consecutiveFailures,
          lastRun: data.lastRun,
        },
        create: {
          step,
          status: data.status || 'active',
          consecutiveFailures: data.consecutiveFailures || 0,
          lastRun: data.lastRun || new Date(),
        },
      });
      return;
    } catch (err) {
      console.error(`[DataLayer] DB updatePipelineStepState (${step}) error:`, err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const current = await safeReadJson<Record<string, any>>('pipeline_state.json', {});
  current[step] = { ...(current[step] || {}), ...data, lastRun: data.lastRun ? data.lastRun.toISOString() : current[step]?.lastRun };
  await safeWriteJson('pipeline_state.json', current);
}

export async function updatePipelineState(state: Record<string, any>): Promise<void> {
  for (const [step, data] of Object.entries(state)) {
    await updatePipelineStepState(step, {
      status: data.status,
      consecutiveFailures: data.consecutiveFailures,
      lastRun: data.lastRun ? new Date(data.lastRun) : undefined,
    });
  }
}

export async function getPipelineLogs(limit = 100): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      return await db.pipelineLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
    } catch (err) {
      console.error('[DataLayer] DB getPipelineLogs error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any[]>('pipeline_log.json', []);
}

export async function appendPipelineLog(entry: { step: string; status: string; detail?: string; error?: string }): Promise<void> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.pipelineLog.create({
        data: {
          step: entry.step,
          status: entry.status,
          detail: entry.detail || null,
          error: entry.error || null,
        },
      });
      return;
    } catch (err) {
      console.error('[DataLayer] DB appendPipelineLog error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const logs = await safeReadJson<any[]>('pipeline_log.json', []);
  logs.unshift({ ...entry, timestamp: new Date().toISOString() });
  await safeWriteJson('pipeline_log.json', logs.slice(0, 100));
}

export async function getAutomationConfig(): Promise<any> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const row = await db.setting.findUnique({ where: { key: 'automation_config' } });
      if (row && row.value) return row.value;
    } catch (err) {
      console.error('[DataLayer] DB getAutomationConfig error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  return await safeReadJson<any>('automation_config.json', {
    trend_scout: { enabled: true, schedule: '0 8 * * *', lastRun: null },
    publisher: { enabled: true, schedule: '0 9 * * *', lastRun: null },
    health_monitor: { enabled: true, schedule: '0 12 * * *', lastRun: null },
    content_doctor: { enabled: true, schedule: '0 3 * * 1', lastRun: null },
    weekly_report: { enabled: true, schedule: '0 9 * * 0', lastRun: null },
  });
}

export async function saveAutomationConfig(config: any): Promise<any> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.setting.upsert({
        where: { key: 'automation_config' },
        update: { value: JSON.parse(JSON.stringify(config)) },
        create: { key: 'automation_config', value: JSON.parse(JSON.stringify(config)) },
      });
      return config;
    } catch (err) {
      console.error('[DataLayer] DB saveAutomationConfig error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  await safeWriteJson('automation_config.json', config);
  return config;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. NEWSLETTER SUBSCRIBERS
// ─────────────────────────────────────────────────────────────────────────────
export async function getSubscribers(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      return await db.newsletterSubscriber.findMany({
        orderBy: { subscribedAt: 'desc' },
      });
    } catch (err) {
      console.error('[DataLayer] DB getSubscribers error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any[]>('subscribers.json', []);
}

export const getNewsletterSubscribers = getSubscribers;

export async function addSubscriber(email: string, niche = 'general'): Promise<any> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      return await db.newsletterSubscriber.upsert({
        where: { email },
        update: { niche, status: 'active' },
        create: { email, niche, status: 'active' },
      });
    } catch (err) {
      console.error('[DataLayer] DB addSubscriber error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const list = await safeReadJson<any[]>('subscribers.json', []);
  const found = list.find((s: any) => s.email === email);
  if (!found) {
    const entry = { email, niche, status: 'active', subscribedAt: new Date().toISOString() };
    list.unshift(entry);
    await safeWriteJson('subscribers.json', list);
    return entry;
  }
  return found;
}

export const addNewsletterSubscriber = addSubscriber;

export async function logNewsletterSend(logEntry: {
  subject: string;
  recipientCount: number;
  niche: string;
}): Promise<any> {
  const logs = await safeReadJson<any[]>('newsletter_log.json', []);
  const entry = {
    id: `nl-${Date.now()}`,
    ...logEntry,
    sentAt: new Date().toISOString(),
    status: 'dispatched',
  };
  logs.unshift(entry);
  await safeWriteJson('newsletter_log.json', logs.slice(0, 100));
  return entry;
}

export async function getNewsletterLogs(): Promise<any[]> {
  return await safeReadJson<any[]>('newsletter_log.json', []);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. AD SLOTS & CLICKS & AFFILIATES
// ─────────────────────────────────────────────────────────────────────────────
export async function getAdSlots(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const slots = await db.adSlot.findMany({
        orderBy: [{ priority: 'asc' }, { weight: 'desc' }],
      });
      if (slots && slots.length > 0) return slots;
    } catch (err) {
      console.error('[DataLayer] DB getAdSlots error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any[]>('adslots.json', []);
}

export async function saveAdSlot(slot: any): Promise<any> {
  const db = getPrisma();
  const idStr = String(slot.id || `slot-${Date.now()}`);

  if (db && isDatabaseConnected()) {
    try {
      return await db.adSlot.upsert({
        where: { id: idStr },
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
          isActive: slot.isActive !== false,
          requiresDisclosure: slot.requiresDisclosure !== false,
          frequencyCapPerUser: Number(slot.frequencyCapPerUser) || 0,
          priority: Number(slot.priority) || 1,
        },
        create: {
          id: idStr,
          name: slot.name,
          siteTargeting: slot.siteTargeting || 'all',
          placement: slot.placement || 'midFeed',
          type: slot.type || 'house',
          adCode: slot.adCode || null,
          headline: slot.headline || null,
          description: slot.description || null,
          ctaUrl: slot.ctaUrl || null,
          weight: Number(slot.weight) || 1,
          isActive: slot.isActive !== false,
          requiresDisclosure: slot.requiresDisclosure !== false,
          frequencyCapPerUser: Number(slot.frequencyCapPerUser) || 0,
          priority: Number(slot.priority) || 1,
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB saveAdSlot error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const slots = await safeReadJson<any[]>('adslots.json', []);
  const idx = slots.findIndex((s: any) => String(s.id) === idStr);
  if (idx >= 0) {
    slots[idx] = { ...slots[idx], ...slot };
  } else {
    slots.push({ id: idStr, ...slot });
  }
  await safeWriteJson('adslots.json', slots);
  return slot;
}

export async function deleteAdSlot(id: string): Promise<boolean> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.adSlot.delete({ where: { id: String(id) } });
      return true;
    } catch (err) {
      console.error('[DataLayer] DB deleteAdSlot error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  let slots = await safeReadJson<any[]>('adslots.json', []);
  const initialLen = slots.length;
  slots = slots.filter((s: any) => String(s.id) !== String(id));
  await safeWriteJson('adslots.json', slots);
  return slots.length < initialLen;
}

export async function killswitchAllAdSlots(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.adSlot.updateMany({ data: { isActive: false } });
      return await db.adSlot.findMany();
    } catch (err) {
      console.error('[DataLayer] DB killswitchAllAdSlots error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const slots = await safeReadJson<any[]>('adslots.json', []);
  const updated = slots.map((s: any) => ({ ...s, isActive: false }));
  await safeWriteJson('adslots.json', updated);
  return updated;
}

export const killswitchAdSlots = killswitchAllAdSlots;

export async function getAffiliateLinks(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const links = await db.affiliateLink.findMany({
        orderBy: { updatedAt: 'desc' },
      });
      if (links && links.length > 0) return links;
    } catch (err) {
      console.error('[DataLayer] DB getAffiliateLinks error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any[]>('affiliate_links.json', []);
}

export async function saveAffiliateLink(link: any): Promise<any> {
  const db = getPrisma();
  const idStr = String(link.id || `aff-${Date.now()}`);

  if (db && isDatabaseConnected()) {
    try {
      return await db.affiliateLink.upsert({
        where: { id: idStr },
        update: {
          name: link.name,
          slug: link.slug,
          affiliateUrl: link.affiliateUrl,
          niche: link.niche || 'crypto',
          commissionEstimate: link.commissionEstimate || null,
          isActive: link.isActive !== false,
        },
        create: {
          id: idStr,
          name: link.name,
          slug: link.slug,
          affiliateUrl: link.affiliateUrl,
          niche: link.niche || 'crypto',
          commissionEstimate: link.commissionEstimate || null,
          isActive: link.isActive !== false,
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB saveAffiliateLink error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const links = await safeReadJson<any[]>('affiliate_links.json', []);
  const idx = links.findIndex((l: any) => String(l.id) === idStr);
  if (idx >= 0) {
    links[idx] = { ...links[idx], ...link };
  } else {
    links.push({ id: idStr, ...link });
  }
  await safeWriteJson('affiliate_links.json', links);
  return link;
}

export async function deleteAffiliateLink(id: string): Promise<boolean> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.affiliateLink.delete({ where: { id: String(id) } });
      return true;
    } catch (err) {
      console.error('[DataLayer] DB deleteAffiliateLink error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  let links = await safeReadJson<any[]>('affiliate_links.json', []);
  const initialLen = links.length;
  links = links.filter((l: any) => String(l.id) !== String(id));
  await safeWriteJson('affiliate_links.json', links);
  return links.length < initialLen;
}

export async function logAffiliateClick(slug: string, targetUrl: string, site?: string, device?: string): Promise<void> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.$transaction([
        db.clickLog.create({
          data: {
            slug,
            targetUrl,
            site: site || null,
            device: device || null,
          },
        }),
        db.affiliateLink.updateMany({
          where: { slug },
          data: { clicksCount: { increment: 1 } },
        }),
      ]);
      return;
    } catch (err) {
      console.error('[DataLayer] DB logAffiliateClick error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const logs = await safeReadJson<any[]>('click_log.json', []);
  logs.unshift({ slug, targetUrl, site, device, id: `click-${Date.now()}`, timestamp: new Date().toISOString() });
  await safeWriteJson('click_log.json', logs.slice(0, 500));
}

export async function getAffiliateClicksToday(): Promise<Record<string, number>> {
  const db = getPrisma();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  if (db && isDatabaseConnected()) {
    try {
      const logs = await db.clickLog.findMany({
        where: { timestamp: { gte: startOfDay } },
      });
      const counts: Record<string, number> = {};
      for (const log of logs) {
        counts[log.slug] = (counts[log.slug] || 0) + 1;
      }
      return counts;
    } catch (err) {
      console.error('[DataLayer] DB getAffiliateClicksToday error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const logs = await safeReadJson<any[]>('click_log.json', []);
  const counts: Record<string, number> = {};
  for (const log of logs) {
    if (new Date(log.timestamp) >= startOfDay) {
      counts[log.slug] = (counts[log.slug] || 0) + 1;
    }
  }
  return counts;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. PAYMENTS & TRANSACTIONS
// ─────────────────────────────────────────────────────────────────────────────
export async function getPaymentTransactions(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      return await db.paymentTransaction.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      console.error('[DataLayer] DB getPaymentTransactions error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any[]>('payment_transactions.json', []);
}

export async function savePaymentTransaction(tx: any): Promise<any> {
  const db = getPrisma();
  const idStr = String(tx.id || `tx-${Date.now()}`);

  if (db && isDatabaseConnected()) {
    try {
      return await db.paymentTransaction.upsert({
        where: { id: idStr },
        update: {
          orderId: tx.orderId || null,
          paymentId: tx.paymentId || null,
          amount: Number(tx.amount) || 0,
          currency: tx.currency || 'USD',
          gateway: tx.gateway || 'razorpay',
          status: tx.status || 'paid',
          customerEmail: tx.customerEmail || null,
          customerName: tx.customerName || null,
          productId: tx.productId || null,
          productName: tx.productName || null,
          metadata: tx.metadata ? JSON.parse(JSON.stringify(tx.metadata)) : undefined,
        },
        create: {
          id: idStr,
          orderId: tx.orderId || null,
          paymentId: tx.paymentId || null,
          amount: Number(tx.amount) || 0,
          currency: tx.currency || 'USD',
          gateway: tx.gateway || 'razorpay',
          status: tx.status || 'paid',
          customerEmail: tx.customerEmail || null,
          customerName: tx.customerName || null,
          productId: tx.productId || null,
          productName: tx.productName || null,
          metadata: tx.metadata ? JSON.parse(JSON.stringify(tx.metadata)) : undefined,
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB savePaymentTransaction error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const list = await safeReadJson<any[]>('payment_transactions.json', []);
  list.unshift({ ...tx, id: idStr, createdAt: new Date().toISOString() });
  await safeWriteJson('payment_transactions.json', list);
  return tx;
}

export async function deletePaymentTransaction(id: string): Promise<boolean> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.paymentTransaction.delete({ where: { id: String(id) } });
      return true;
    } catch (err) {
      console.error('[DataLayer] DB deletePaymentTransaction error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  let list = await safeReadJson<any[]>('payment_transactions.json', []);
  const initialLen = list.length;
  list = list.filter((t: any) => String(t.id) !== String(id));
  await safeWriteJson('payment_transactions.json', list);
  return list.length < initialLen;
}

export async function getWebhookLogs(): Promise<any[]> {
  return await safeReadJson<any[]>('webhook_logs.json', []);
}

export async function saveWebhookLog(eventData: any): Promise<void> {
  const logs = await safeReadJson<any[]>('webhook_logs.json', []);
  logs.unshift({
    id: `wh_${Date.now()}`,
    receivedAt: new Date().toISOString(),
    event: eventData?.event || 'unknown',
    payload: eventData?.payload || {},
  });
  await safeWriteJson('webhook_logs.json', logs.slice(0, 100));
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. SETTINGS REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────
export async function getSettings(): Promise<Record<string, any>> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const all = await db.setting.findMany();
      if (all && all.length > 0) {
        const map: Record<string, any> = {};
        for (const s of all) {
          map[s.key] = s.value;
        }
        return map;
      }
    } catch (err) {
      console.error('[DataLayer] DB getSettings error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  return await safeReadJson<Record<string, any>>('settings.json', {});
}

export const getSettingsMap = getSettings;

export async function saveSettings(settingsObj: Record<string, any>): Promise<void> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      for (const [key, value] of Object.entries(settingsObj)) {
        await db.setting.upsert({
          where: { key },
          update: { value: JSON.parse(JSON.stringify(value)) },
          create: { key, value: JSON.parse(JSON.stringify(value)) },
        });
      }
      return;
    } catch (err) {
      console.error(`[DataLayer] DB saveSettings error:`, err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const settings = await safeReadJson<Record<string, any>>('settings.json', {});
  const merged = { ...settings, ...settingsObj };
  await safeWriteJson('settings.json', merged);
}

export async function setSetting(key: string, value: any): Promise<void> {
  await saveSettings({ [key]: value });
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. SYSTEM ALERTS
// ─────────────────────────────────────────────────────────────────────────────
export async function getAlerts(limit = 50): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      return await db.alertLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } catch (err) {
      console.error('[DataLayer] DB getAlerts error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any[]>('alerts.json', []);
}

export async function addAlert(entry: { type: string; message: string; severity: string }): Promise<any> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      return await db.alertLog.create({
        data: {
          type: entry.type,
          message: entry.message,
          severity: entry.severity,
          resolved: false,
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB addAlert error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const alerts = await safeReadJson<any[]>('alerts.json', []);
  const newAlert = { ...entry, id: `alert-${Date.now()}`, resolved: false, createdAt: new Date().toISOString() };
  alerts.unshift(newAlert);
  await safeWriteJson('alerts.json', alerts.slice(0, 100));
  return newAlert;
}

export async function resolveAlert(id: string): Promise<boolean> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.alertLog.update({
        where: { id },
        data: { resolved: true },
      });
      return true;
    } catch (err) {
      console.error('[DataLayer] DB resolveAlert error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const alerts = await safeReadJson<any[]>('alerts.json', []);
  const found = alerts.find((a: any) => a.id === id);
  if (found) {
    found.resolved = true;
    await safeWriteJson('alerts.json', alerts);
    return true;
  }
  return false;
}

export async function getContentDoctorLogs(limit = 100): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      return await db.contentDoctorLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
    } catch (err) {
      console.error('[DataLayer] DB getContentDoctorLogs error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any[]>('content_doctor_log.json', []);
}

export async function addContentDoctorLog(entry: { articleId?: string | number; action: string; summary?: string; qaScore?: number }): Promise<void> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.contentDoctorLog.create({
        data: {
          articleId: entry.articleId ? String(entry.articleId) : null,
          action: entry.action,
          summary: entry.summary || null,
          qaScore: typeof entry.qaScore === 'number' ? entry.qaScore : null,
        },
      });
      return;
    } catch (err) {
      console.error('[DataLayer] DB addContentDoctorLog error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const logs = await safeReadJson<any[]>('content_doctor_log.json', []);
  logs.unshift({ ...entry, id: `doc-${Date.now()}`, timestamp: new Date().toISOString() });
  await safeWriteJson('content_doctor_log.json', logs.slice(0, 200));
}

export async function getSitemapQueueUrls(): Promise<string[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const rows = await db.sitemapQueue.findMany({ select: { url: true } });
      return rows.map((r: any) => r.url);
    } catch (err) {
      console.error('[DataLayer] DB getSitemapQueueUrls error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<string[]>('sitemap_queue.json', []);
}

export async function addSitemapQueueUrl(url: string): Promise<void> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.sitemapQueue.upsert({
        where: { url },
        update: { status: 'pending' },
        create: { url, status: 'pending' },
      });
      return;
    } catch (err) {
      console.error('[DataLayer] DB addSitemapQueueUrl error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const queue = await safeReadJson<string[]>('sitemap_queue.json', []);
  if (!queue.includes(url)) {
    queue.push(url);
    await safeWriteJson('sitemap_queue.json', queue);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. DIGITAL PRODUCTS & SPONSORS & CRM & BACKLINKS
// ─────────────────────────────────────────────────────────────────────────────
export async function getDigitalProducts(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const products = await db.digitalProduct.findMany({
        orderBy: { salesCount: 'desc' },
      });
      if (products && products.length > 0) return products;
    } catch (err) {
      console.error('[DataLayer] DB getDigitalProducts error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any[]>('digital_products.json', []);
}

export async function saveDigitalProduct(product: any): Promise<any> {
  const db = getPrisma();
  const idStr = String(product.id || `dp-${Date.now()}`);

  if (db && isDatabaseConnected()) {
    try {
      return await db.digitalProduct.upsert({
        where: { id: idStr },
        update: {
          name: product.name,
          niche: product.niche || 'news',
          price: Number(product.price) || 0,
          format: product.format || 'Digital Download',
          description: product.description || '',
          targetKeywords: product.targetKeywords || [],
          salesCount: Number(product.salesCount) || 0,
          revenue: Number(product.revenue) || 0,
          downloadUrl: product.downloadUrl || '',
          ctaText: product.ctaText || 'Get Access',
          isActive: product.isActive !== false,
        },
        create: {
          id: idStr,
          name: product.name,
          niche: product.niche || 'news',
          price: Number(product.price) || 0,
          format: product.format || 'Digital Download',
          description: product.description || '',
          targetKeywords: product.targetKeywords || [],
          salesCount: Number(product.salesCount) || 0,
          revenue: Number(product.revenue) || 0,
          downloadUrl: product.downloadUrl || '',
          ctaText: product.ctaText || 'Get Access',
          isActive: product.isActive !== false,
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB saveDigitalProduct error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const products = await safeReadJson<any[]>('digital_products.json', []);
  const idx = products.findIndex((p: any) => String(p.id) === idStr);
  if (idx >= 0) {
    products[idx] = { ...products[idx], ...product };
  } else {
    products.push({ id: idStr, ...product });
  }
  await safeWriteJson('digital_products.json', products);
  return product;
}

export async function deleteDigitalProduct(id: string): Promise<boolean> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.digitalProduct.delete({ where: { id: String(id) } });
      return true;
    } catch (err) {
      console.error('[DataLayer] DB deleteDigitalProduct error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  let products = await safeReadJson<any[]>('digital_products.json', []);
  const initialLen = products.length;
  products = products.filter((p: any) => String(p.id) !== String(id));
  await safeWriteJson('digital_products.json', products);
  return products.length < initialLen;
}

export async function getSponsors(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const sponsors = await db.sponsor.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (sponsors && sponsors.length > 0) return sponsors;
    } catch (err) {
      console.error('[DataLayer] DB getSponsors error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any[]>('sponsors.json', []);
}

export async function saveSponsor(sponsor: any): Promise<any> {
  const db = getPrisma();
  const idStr = String(sponsor.id || `sp-${Date.now()}`);

  if (db && isDatabaseConnected()) {
    try {
      return await db.sponsor.upsert({
        where: { id: idStr },
        update: {
          brandName: sponsor.brandName,
          logoUrl: sponsor.logoUrl || null,
          headline: sponsor.headline || '',
          ctaText: sponsor.ctaText || 'Learn More',
          ctaUrl: sponsor.ctaUrl || '',
          placement: sponsor.placement || 'header_takeover',
          niche: sponsor.niche || 'all',
          cpm: Number(sponsor.cpm) || 0,
          impressionsDelivered: Number(sponsor.impressionsDelivered) || 0,
          active: sponsor.active !== false,
          tier: sponsor.tier || 'standard',
          startDate: sponsor.startDate || null,
          endDate: sponsor.endDate || null,
        },
        create: {
          id: idStr,
          brandName: sponsor.brandName,
          logoUrl: sponsor.logoUrl || null,
          headline: sponsor.headline || '',
          ctaText: sponsor.ctaText || 'Learn More',
          ctaUrl: sponsor.ctaUrl || '',
          placement: sponsor.placement || 'header_takeover',
          niche: sponsor.niche || 'all',
          cpm: Number(sponsor.cpm) || 0,
          impressionsDelivered: Number(sponsor.impressionsDelivered) || 0,
          active: sponsor.active !== false,
          tier: sponsor.tier || 'standard',
          startDate: sponsor.startDate || null,
          endDate: sponsor.endDate || null,
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB saveSponsor error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const sponsors = await safeReadJson<any[]>('sponsors.json', []);
  const idx = sponsors.findIndex((s: any) => String(s.id) === idStr);
  if (idx >= 0) {
    sponsors[idx] = { ...sponsors[idx], ...sponsor };
  } else {
    sponsors.push({ id: idStr, ...sponsor });
  }
  await safeWriteJson('sponsors.json', sponsors);
  return sponsor;
}

export async function deleteSponsor(id: string): Promise<boolean> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.sponsor.delete({ where: { id: String(id) } });
      return true;
    } catch (err) {
      console.error('[DataLayer] DB deleteSponsor error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  let sponsors = await safeReadJson<any[]>('sponsors.json', []);
  const initialLen = sponsors.length;
  sponsors = sponsors.filter((s: any) => String(s.id) !== String(id));
  await safeWriteJson('sponsors.json', sponsors);
  return sponsors.length < initialLen;
}

export async function getSponsorshipInquiries(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      return await db.sponsorshipInquiry.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      console.error('[DataLayer] DB getSponsorshipInquiries error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any[]>('sponsorship_inquiries.json', []);
}

export async function saveSponsorshipInquiry(inquiry: any): Promise<any> {
  const db = getPrisma();
  const idStr = String(inquiry.id || `inq-${Date.now()}`);

  if (db && isDatabaseConnected()) {
    try {
      return await db.sponsorshipInquiry.upsert({
        where: { id: idStr },
        update: {
          brandName: inquiry.brandName,
          contactEmail: inquiry.contactEmail,
          companyWebsite: inquiry.companyWebsite || null,
          niche: inquiry.niche,
          tier: inquiry.tier,
          budget: inquiry.budget || null,
          message: inquiry.message || null,
          status: inquiry.status || 'new',
        },
        create: {
          id: idStr,
          brandName: inquiry.brandName,
          contactEmail: inquiry.contactEmail,
          companyWebsite: inquiry.companyWebsite || null,
          niche: inquiry.niche,
          tier: inquiry.tier,
          budget: inquiry.budget || null,
          message: inquiry.message || null,
          status: inquiry.status || 'new',
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB saveSponsorshipInquiry error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const list = await safeReadJson<any[]>('sponsorship_inquiries.json', []);
  list.unshift({ ...inquiry, id: idStr, createdAt: new Date().toISOString() });
  await safeWriteJson('sponsorship_inquiries.json', list);
  return inquiry;
}

export async function deleteSponsorshipInquiry(id: string): Promise<boolean> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.sponsorshipInquiry.delete({ where: { id: String(id) } });
      return true;
    } catch (err) {
      console.error('[DataLayer] DB deleteSponsorshipInquiry error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  let list = await safeReadJson<any[]>('sponsorship_inquiries.json', []);
  const initialLen = list.length;
  list = list.filter((i: any) => String(i.id) !== String(id));
  await safeWriteJson('sponsorship_inquiries.json', list);
  return list.length < initialLen;
}

export async function getCrmCustomers(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const customers = await db.crmCustomer.findMany({
        orderBy: { lastActive: 'desc' },
      });
      if (customers && customers.length > 0) return customers;
    } catch (err) {
      console.error('[DataLayer] DB getCrmCustomers error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any[]>('crm_customers.json', []);
}

export async function saveCrmCustomer(customer: any): Promise<any> {
  const db = getPrisma();
  const idStr = String(customer.id || `crm_cust_${Date.now()}`);

  if (db && isDatabaseConnected()) {
    try {
      return await db.crmCustomer.upsert({
        where: { email: customer.email },
        update: {
          name: customer.name,
          company: customer.company || null,
          phone: customer.phone || null,
          country: customer.country || null,
          avatar: customer.avatar || null,
          tier: customer.tier || 'Standard',
          status: customer.status || 'Active',
          totalSpentUsd: Number(customer.totalSpentUsd) || 0,
          totalSpentInr: Number(customer.totalSpentInr) || 0,
          ordersCount: Number(customer.ordersCount) || 0,
          tags: customer.tags || [],
          assignedRep: customer.assignedRep || null,
          notes: customer.notes || null,
          deals: customer.deals || [],
        },
        create: {
          id: idStr,
          name: customer.name,
          email: customer.email,
          company: customer.company || null,
          phone: customer.phone || null,
          country: customer.country || null,
          avatar: customer.avatar || null,
          tier: customer.tier || 'Standard',
          status: customer.status || 'Active',
          totalSpentUsd: Number(customer.totalSpentUsd) || 0,
          totalSpentInr: Number(customer.totalSpentInr) || 0,
          ordersCount: Number(customer.ordersCount) || 0,
          tags: customer.tags || [],
          assignedRep: customer.assignedRep || null,
          notes: customer.notes || null,
          deals: customer.deals || [],
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB saveCrmCustomer error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const customers = await safeReadJson<any[]>('crm_customers.json', []);
  const idx = customers.findIndex((c: any) => c.email === customer.email || c.id === customer.id);
  if (idx >= 0) {
    customers[idx] = { ...customers[idx], ...customer };
  } else {
    customers.push({ id: idStr, ...customer });
  }
  await safeWriteJson('crm_customers.json', customers);
  return customer;
}

export async function deleteCrmCustomer(id: string): Promise<boolean> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.crmCustomer.delete({ where: { id: String(id) } });
      return true;
    } catch (err) {
      console.error('[DataLayer] DB deleteCrmCustomer error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  let customers = await safeReadJson<any[]>('crm_customers.json', []);
  const initialLen = customers.length;
  customers = customers.filter((c: any) => String(c.id) !== String(id));
  await safeWriteJson('crm_customers.json', customers);
  return customers.length < initialLen;
}

export async function getCrmInvoices(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const invoices = await db.invoice.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (invoices && invoices.length > 0) return invoices;
    } catch (err) {
      console.error('[DataLayer] DB getCrmInvoices error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any[]>('invoices.json', []);
}

export async function saveCrmInvoice(invoice: any): Promise<any> {
  const db = getPrisma();
  const idStr = String(invoice.id || `INV-2026-${Math.floor(100 + Math.random() * 900)}`);

  if (db && isDatabaseConnected()) {
    try {
      return await db.invoice.upsert({
        where: { id: idStr },
        update: {
          clientName: invoice.clientName,
          clientCompany: invoice.clientCompany || null,
          clientEmail: invoice.clientEmail,
          currency: invoice.currency || 'USD',
          subtotal: Number(invoice.subtotal) || 0,
          taxRate: Number(invoice.taxRate) || 0,
          taxAmount: Number(invoice.taxAmount) || 0,
          total: Number(invoice.total) || 0,
          issueDate: invoice.issueDate || new Date().toISOString().split('T')[0],
          dueDate: invoice.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          status: invoice.status || 'Pending',
          paymentMethod: invoice.paymentMethod || null,
          paymentRef: invoice.paymentRef || null,
          items: invoice.items ? JSON.parse(JSON.stringify(invoice.items)) : undefined,
          notes: invoice.notes || null,
        },
        create: {
          id: idStr,
          clientName: invoice.clientName,
          clientCompany: invoice.clientCompany || null,
          clientEmail: invoice.clientEmail,
          currency: invoice.currency || 'USD',
          subtotal: Number(invoice.subtotal) || 0,
          taxRate: Number(invoice.taxRate) || 0,
          taxAmount: Number(invoice.taxAmount) || 0,
          total: Number(invoice.total) || 0,
          issueDate: invoice.issueDate || new Date().toISOString().split('T')[0],
          dueDate: invoice.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          status: invoice.status || 'Pending',
          paymentMethod: invoice.paymentMethod || null,
          paymentRef: invoice.paymentRef || null,
          items: invoice.items ? JSON.parse(JSON.stringify(invoice.items)) : undefined,
          notes: invoice.notes || null,
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB saveCrmInvoice error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const list = await safeReadJson<any[]>('invoices.json', []);
  const idx = list.findIndex((i: any) => i.id === idStr);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...invoice };
  } else {
    list.unshift({ ...invoice, id: idStr });
  }
  await safeWriteJson('invoices.json', list);
  return invoice;
}

export async function deleteCrmInvoice(id: string): Promise<boolean> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.invoice.delete({ where: { id: String(id) } });
      return true;
    } catch (err) {
      console.error('[DataLayer] DB deleteCrmInvoice error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  let list = await safeReadJson<any[]>('invoices.json', []);
  const initialLen = list.length;
  list = list.filter((i: any) => String(i.id) !== String(id));
  await safeWriteJson('invoices.json', list);
  return list.length < initialLen;
}

export async function getAttributionData(): Promise<any> {
  return await safeReadJson<any>('click_attribution.json', {
    totalImpressions: 284500,
    totalClicks: 12840,
    overallCtr: 4.51,
    totalConversions: 492,
    conversionRate: 3.83,
    estimatedRevenueUsd: 8420.50,
    sources: [],
    topCampaigns: [],
    geoDistribution: [],
    deviceSplit: { desktop: 58.4, mobile: 37.2, tablet: 4.4 },
    recentClickStream: []
  });
}

export async function getBacklinks(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const backlinks = await db.backlink.findMany({
        orderBy: { addedAt: 'desc' },
      });
      if (backlinks && backlinks.length > 0) return backlinks;
    } catch (err) {
      console.error('[DataLayer] DB getBacklinks error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any[]>('backlinks.json', []);
}

export async function saveBacklink(backlink: any): Promise<any> {
  const db = getPrisma();
  const idStr = String(backlink.id || `bl-${Date.now()}`);

  if (db && isDatabaseConnected()) {
    try {
      return await db.backlink.upsert({
        where: { id: idStr },
        update: {
          platform: backlink.platform,
          url: backlink.url,
          articleTitle: backlink.articleTitle || null,
          status: backlink.status || 'active',
          clicks: Number(backlink.clicks) || 0,
        },
        create: {
          id: idStr,
          platform: backlink.platform,
          url: backlink.url,
          articleTitle: backlink.articleTitle || null,
          status: backlink.status || 'active',
          clicks: Number(backlink.clicks) || 0,
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB saveBacklink error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const backlinks = await safeReadJson<any[]>('backlinks.json', []);
  const idx = backlinks.findIndex((b: any) => b.id === idStr);
  if (idx >= 0) {
    backlinks[idx] = { ...backlinks[idx], ...backlink };
  } else {
    backlinks.push({ id: idStr, ...backlink });
  }
  await safeWriteJson('backlinks.json', backlinks);
  return backlink;
}

export async function deleteBacklink(id: string): Promise<boolean> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.backlink.delete({ where: { id: String(id) } });
      return true;
    } catch (err) {
      console.error('[DataLayer] DB deleteBacklink error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  let backlinks = await safeReadJson<any[]>('backlinks.json', []);
  const initialLen = backlinks.length;
  backlinks = backlinks.filter((b: any) => String(b.id) !== String(id));
  await safeWriteJson('backlinks.json', backlinks);
  return backlinks.length < initialLen;
}

export async function getTokenUsage(monthStr?: string): Promise<any> {
  const db = getPrisma();
  const currentMonth = monthStr || new Date().toISOString().slice(0, 7);

  if (db && isDatabaseConnected()) {
    try {
      const row = await db.tokenUsage.findUnique({ where: { month: currentMonth } });
      if (row) return row;
    } catch (err) {
      console.error('[DataLayer] DB getTokenUsage error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const local = await safeReadJson<any>('token_usage.json', { month: currentMonth, tokensUsed: 0, estimatedCost: 0 });
  return local.month === currentMonth ? local : { month: currentMonth, tokensUsed: 0, estimatedCost: 0 };
}

export async function updateTokenUsage(tokens: number, cost: number, monthStr?: string): Promise<any> {
  const db = getPrisma();
  const currentMonth = monthStr || new Date().toISOString().slice(0, 7);

  if (db && isDatabaseConnected()) {
    try {
      return await db.tokenUsage.upsert({
        where: { month: currentMonth },
        update: {
          tokensUsed: { increment: tokens },
          estimatedCost: { increment: cost },
        },
        create: {
          month: currentMonth,
          tokensUsed: tokens,
          estimatedCost: cost,
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB updateTokenUsage error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const local = await getTokenUsage(currentMonth);
  local.tokensUsed += tokens;
  local.estimatedCost += cost;
  await safeWriteJson('token_usage.json', local);
  return local;
}

export async function getAnalyticsCache(): Promise<any> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const rows = await db.analyticsCache.findMany();
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      console.error('[DataLayer] DB getAnalyticsCache error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any>('analytics_cache.json', null);
}

export async function setAnalyticsCache(site: string, data: any): Promise<void> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.analyticsCache.upsert({
        where: { id: site },
        update: {
          site,
          todayRevenue: data.todayRevenue || 0,
          weekRevenue: data.weekRevenue || 0,
          monthRevenue: data.monthRevenue || 0,
          pageviews: data.pageviews || 0,
          rpm: data.rpm || 0,
          ctr: data.ctr || 0,
          syncedAt: new Date(),
        },
        create: {
          id: site,
          site,
          todayRevenue: data.todayRevenue || 0,
          weekRevenue: data.weekRevenue || 0,
          monthRevenue: data.monthRevenue || 0,
          pageviews: data.pageviews || 0,
          rpm: data.rpm || 0,
          ctr: data.ctr || 0,
          syncedAt: new Date(),
        },
      });
      return;
    } catch (err) {
      console.error('[DataLayer] DB setAnalyticsCache error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  await safeWriteJson('analytics_cache.json', { cachedAt: new Date().toISOString(), data });
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. SOCIAL LOGS
// ─────────────────────────────────────────────────────────────────────────────
export async function getSocialLogs(limit = 50): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const rows = await db.socialLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: limit,
      });
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      console.error('[DataLayer] DB getSocialLogs error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  const logs = await safeReadJson<any[]>('social_log.json', []);
  return logs.slice(-limit).reverse();
}

export async function appendSocialLog(entry: any): Promise<any> {
  const db = getPrisma();
  const idStr = String(entry.id || `soc-${Date.now()}`);

  if (db && isDatabaseConnected()) {
    try {
      return await db.socialLog.create({
        data: {
          id: idStr,
          platform: entry.platform || 'unknown',
          articleId: entry.articleId ? String(entry.articleId) : null,
          postUrl: entry.url || entry.postUrl || null,
          success: entry.status === 'published' || entry.status === 'simulated' || entry.success !== false,
          metadata: entry ? JSON.parse(JSON.stringify(entry)) : undefined,
          timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(),
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB appendSocialLog error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const logs = await safeReadJson<any[]>('social_log.json', []);
  logs.push({ ...entry, id: idStr, timestamp: entry.timestamp || new Date().toISOString() });
  await safeWriteJson('social_log.json', logs.slice(-200));
  return entry;
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. EMAIL TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────
export async function getEmailTemplates(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const templates = await db.emailTemplate.findMany({
        orderBy: { updatedAt: 'desc' },
      });
      if (templates && templates.length > 0) return templates;
    } catch (err) {
      console.error('[DataLayer] DB getEmailTemplates error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any[]>('email_templates.json', []);
}

export async function saveEmailTemplate(template: any): Promise<any> {
  const db = getPrisma();
  const idStr = String(template.id || `tpl_${Date.now()}`);

  if (db && isDatabaseConnected()) {
    try {
      return await db.emailTemplate.upsert({
        where: { id: idStr },
        update: {
          name: template.name,
          entity: template.entity || 'General',
          category: template.category || 'Communication',
          subject: template.subject,
          preheader: template.preheader || null,
          htmlTemplate: template.htmlTemplate,
          variables: template.variables ? JSON.parse(JSON.stringify(template.variables)) : undefined,
        },
        create: {
          id: idStr,
          name: template.name,
          entity: template.entity || 'General',
          category: template.category || 'Communication',
          subject: template.subject,
          preheader: template.preheader || null,
          htmlTemplate: template.htmlTemplate,
          variables: template.variables ? JSON.parse(JSON.stringify(template.variables)) : undefined,
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB saveEmailTemplate error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const list = await safeReadJson<any[]>('email_templates.json', []);
  const idx = list.findIndex((t: any) => t.id === idStr);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...template };
  } else {
    list.unshift({ ...template, id: idStr });
  }
  await safeWriteJson('email_templates.json', list);
  return template;
}

export async function deleteEmailTemplate(id: string): Promise<boolean> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.emailTemplate.delete({ where: { id: String(id) } });
      return true;
    } catch (err) {
      console.error('[DataLayer] DB deleteEmailTemplate error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  let list = await safeReadJson<any[]>('email_templates.json', []);
  const initialLen = list.length;
  list = list.filter((t: any) => String(t.id) !== String(id));
  await safeWriteJson('email_templates.json', list);
  return list.length < initialLen;
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. META AUTOMATIONS
// ─────────────────────────────────────────────────────────────────────────────
export async function getMetaAutomations(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const rows = await db.metaAutomation.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (rows && rows.length > 0) return rows;
    } catch (err) {
      console.error('[DataLayer] DB getMetaAutomations error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }
  return await safeReadJson<any[]>('meta_automations.json', []);
}

export async function saveMetaAutomation(automation: any): Promise<any> {
  const db = getPrisma();
  const idStr = String(automation.id || `meta_rule_${Date.now()}`);

  if (db && isDatabaseConnected()) {
    try {
      return await db.metaAutomation.upsert({
        where: { id: idStr },
        update: {
          name: automation.name,
          pageHandle: automation.pageHandle || null,
          targetUrl: automation.targetUrl,
          triggerKeyword: automation.triggerKeyword || 'ANY',
          step1FollowRequestDm: automation.step1FollowRequestDm || null,
          step2PayloadDm: automation.step2PayloadDm || null,
          dmTemplate: automation.dmTemplate || null,
          publicCommentReply: automation.publicCommentReply || null,
          dmsSent: Number(automation.dmsSent) || 0,
          conversions: Number(automation.conversions) || 0,
          isActive: automation.isActive !== false,
        },
        create: {
          id: idStr,
          name: automation.name,
          pageHandle: automation.pageHandle || null,
          targetUrl: automation.targetUrl,
          triggerKeyword: automation.triggerKeyword || 'ANY',
          step1FollowRequestDm: automation.step1FollowRequestDm || null,
          step2PayloadDm: automation.step2PayloadDm || null,
          dmTemplate: automation.dmTemplate || null,
          publicCommentReply: automation.publicCommentReply || null,
          dmsSent: Number(automation.dmsSent) || 0,
          conversions: Number(automation.conversions) || 0,
          isActive: automation.isActive !== false,
        },
      });
    } catch (err) {
      console.error('[DataLayer] DB saveMetaAutomation error:', err);
      if (isProductionEnvironment()) throw err;
    }
  }

  const list = await safeReadJson<any[]>('meta_automations.json', []);
  const idx = list.findIndex((a: any) => a.id === idStr);
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...automation };
  } else {
    list.unshift({ ...automation, id: idStr });
  }
  await safeWriteJson('meta_automations.json', list);
  return automation;
}
