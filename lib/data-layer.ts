import fs from 'fs/promises';
import path from 'path';
import { getPrisma } from './prisma';

const DATA_DIR = path.join(process.cwd(), 'data');

export function isDatabaseConnected(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres'));
}

async function safeReadJson<T>(filename: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, filename), 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function safeWriteJson(filename: string, data: any): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`[DataLayer] Local write fallback skipped for ${filename}:`, err);
  }
}

// ─── 1. ARTICLES REPOSITORY ──────────────────────────────────────────────────
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
      console.warn('[DataLayer] DB getArticles failed, checking local vault:', err);
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
      console.warn('[DataLayer] DB getArticleById failed:', err);
    }
  }

  const articles = await getArticles();
  return articles.find((a: any) => String(a.id) === String(id) || a.slug === id) || null;
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
      await db.article.upsert({
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
          qaVerdict: formatted.qaVerdict || undefined,
          source: formatted.source || null,
          viewCount: Number(formatted.viewCount) || 0,
          publishAt: formatted.publishAt ? new Date(formatted.publishAt) : null,
          publishedAt: formatted.publishedAt ? new Date(formatted.publishedAt) : null,
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
          qaVerdict: formatted.qaVerdict || undefined,
          source: formatted.source || null,
          viewCount: Number(formatted.viewCount) || 0,
          publishAt: formatted.publishAt ? new Date(formatted.publishAt) : null,
          publishedAt: formatted.publishedAt ? new Date(formatted.publishedAt) : null,
        },
      });
    } catch (dbErr) {
      console.warn('[DataLayer] DB saveArticle error:', dbErr);
    }
  }

  // Also update local cache
  const articles = await safeReadJson<any[]>('articles.json', []);
  const idx = articles.findIndex((a: any) => String(a.id) === idStr);
  if (idx !== -1) {
    articles[idx] = { ...articles[idx], ...formatted };
  } else {
    articles.unshift(formatted);
  }
  await safeWriteJson('articles.json', articles);

  return formatted;
}

export async function saveArticles(articles: any[]): Promise<void> {
  for (const a of articles) {
    await saveArticle(a);
  }
}

export async function incrementArticleViews(id: string): Promise<number> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const res = await db.article.updateMany({
        where: { OR: [{ id: String(id) }, { slug: String(id) }] },
        data: { viewCount: { increment: 1 } },
      });
      if (res.count > 0) {
        const updated = await getArticleById(id);
        return updated?.viewCount || 1;
      }
    } catch (err) {
      console.warn('[DataLayer] DB increment views error:', err);
    }
  }

  const articles = await safeReadJson<any[]>('articles.json', []);
  const idx = articles.findIndex((a: any) => String(a.id) === String(id) || a.slug === id);
  let views = 1;
  if (idx !== -1) {
    articles[idx].viewCount = (articles[idx].viewCount || 0) + 1;
    views = articles[idx].viewCount;
    await safeWriteJson('articles.json', articles);
  }
  return views;
}

export async function searchArticles(query: string, niche?: string): Promise<any[]> {
  const articles = await getArticles();
  const q = query.toLowerCase().trim();
  return articles.filter((a: any) => {
    const matchesNiche = !niche || niche === 'all' || a.site === niche || a.niche === niche;
    const matchesQuery = !q || (a.title && a.title.toLowerCase().includes(q)) || (a.content && a.content.toLowerCase().includes(q));
    return matchesNiche && matchesQuery;
  });
}

// ─── 2. PIPELINE STATE & LOGS REPOSITORY ─────────────────────────────────────
export async function getPipelineState(): Promise<Record<string, any>> {
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

  return await safeReadJson('pipeline_state.json', {
    trend_scout: { status: 'active', consecutiveFailures: 0 },
    qa_review: { status: 'active', consecutiveFailures: 0 },
    publisher: { status: 'active', consecutiveFailures: 0 },
  });
}

export async function updatePipelineState(state: Record<string, any>): Promise<void> {
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

  await safeWriteJson('pipeline_state.json', state);
}

export async function getPipelineLogs(limit = 20): Promise<any[]> {
  const logs = await safeReadJson<any[]>('pipeline_log.json', []);
  return logs.slice(-limit).reverse();
}

export async function appendPipelineLog(entry: { step: string; status: string; detail: string; timestamp?: string }): Promise<void> {
  const logEntry = {
    timestamp: entry.timestamp || new Date().toISOString(),
    step: entry.step,
    status: entry.status,
    detail: entry.detail,
  };

  const logs = await safeReadJson<any[]>('pipeline_log.json', []);
  logs.push(logEntry);
  await safeWriteJson('pipeline_log.json', logs.slice(-500));
}

// ─── 3. AD SLOTS REPOSITORY ──────────────────────────────────────────────────
export async function getAdSlots(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const dbSlots = await db.adSlot.findMany({
        orderBy: { priority: 'asc' },
      });
      if (dbSlots && dbSlots.length > 0) return dbSlots;
    } catch (err) {
      console.warn('[DataLayer] DB adslots failed:', err);
    }
  }

  return await safeReadJson<any[]>('adslots.json', []);
}

export async function saveAdSlot(slot: any): Promise<any> {
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

  const slots = await safeReadJson<any[]>('adslots.json', []);
  const idx = slots.findIndex((s: any) => s.id === slot.id);
  if (idx !== -1) {
    slots[idx] = { ...slots[idx], ...slot };
  } else {
    slots.push(slot);
  }
  await safeWriteJson('adslots.json', slots);

  return slot;
}

export async function killswitchAllAdSlots(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.adSlot.updateMany({ data: { isActive: false } });
    } catch (err) {
      console.warn('[DataLayer] DB killswitch error:', err);
    }
  }

  const slots = await safeReadJson<any[]>('adslots.json', []);
  const updated = slots.map((s: any) => ({ ...s, isActive: false }));
  await safeWriteJson('adslots.json', updated);
  return updated;
}

// ─── 4. AFFILIATE LINKS & CLICKS ─────────────────────────────────────────────
export async function getAffiliateLinks(): Promise<any[]> {
  return await safeReadJson<any[]>('affiliate_links.json', []);
}

export async function saveAffiliateLink(link: any): Promise<any> {
  const links = await getAffiliateLinks();
  const idx = links.findIndex((l: any) => l.id === link.id);
  if (idx !== -1) {
    links[idx] = { ...links[idx], ...link };
  } else {
    links.push(link);
  }
  await safeWriteJson('affiliate_links.json', links);
  return link;
}

export async function deleteAffiliateLink(id: string): Promise<boolean> {
  const links = await getAffiliateLinks();
  const filtered = links.filter((l: any) => l.id !== id);
  await safeWriteJson('affiliate_links.json', filtered);
  return true;
}

export async function logAffiliateClick(slug: string, targetUrl: string, site?: string): Promise<void> {
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

  const clicks = await safeReadJson<any[]>('click_log.json', []);
  clicks.unshift({
    slug,
    targetUrl,
    site: site || 'general',
    timestamp: new Date().toISOString(),
  });
  await safeWriteJson('click_log.json', clicks.slice(0, 500));
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
      logs.forEach((l: any) => {
        counts[l.slug] = (counts[l.slug] || 0) + 1;
      });
      return counts;
    } catch (err) {
      console.warn('[DataLayer] DB click logs today error:', err);
    }
  }

  const clicks = await safeReadJson<any[]>('click_log.json', []);
  const counts: Record<string, number> = {};
  clicks.forEach((c: any) => {
    if (new Date(c.timestamp) >= startOfDay) {
      counts[c.slug] = (counts[c.slug] || 0) + 1;
    }
  });
  return counts;
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

  return await safeReadJson<Record<string, any>>('settings.json', {});
}

export async function saveSettings(settings: Record<string, any>): Promise<void> {
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

  await safeWriteJson('settings.json', settings);
}

// ─── 6. NEWSLETTER SUBSCRIBERS ───────────────────────────────────────────────
export async function getNewsletterSubscribers(): Promise<any[]> {
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

  return await safeReadJson<any[]>('subscribers.json', []);
}

export async function addNewsletterSubscriber(email: string, niche = 'general'): Promise<any> {
  const cleanEmail = email.trim().toLowerCase();
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

  const subs = await safeReadJson<any[]>('subscribers.json', []);
  const exists = subs.some((s: any) => s.email.toLowerCase() === cleanEmail);
  if (!exists) {
    subs.unshift({ email: cleanEmail, niche, subscribedAt: new Date().toISOString() });
    await safeWriteJson('subscribers.json', subs);
  }

  return { email: cleanEmail, niche };
}

// ─── 7. QA LOGS & CONFIG REPOSITORY ──────────────────────────────────────────
export async function saveQALog(qaData: {
  articleId: string;
  verdict: string;
  averageScore: number;
  scores?: any;
  rejectionReason?: string;
  revisionInstructions?: string;
  model?: string;
}): Promise<void> {
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

export async function getQAConfig(): Promise<any> {
  return await safeReadJson('qa_config.json', {
    approveThreshold: 8,
    reviseThreshold: 5,
    maxRevisionAttempts: 1,
    autoPublishApproved: true,
    requireQAForPublish: true,
  });
}

export async function saveQAConfig(config: any): Promise<void> {
  await safeWriteJson('qa_config.json', config);
}

// ─── 8. AUTOMATION CONFIG ───────────────────────────────────────────────────
export async function getAutomationConfig(): Promise<any> {
  return await safeReadJson('automation_config.json', {
    trend_scout: { enabled: true, schedule: '0 8 * * *', lastRun: null },
    publisher: { enabled: true, schedule: '0 9 * * *', lastRun: null },
    health_monitor: { enabled: true, schedule: '0 12 * * *', lastRun: null },
    content_doctor: { enabled: true, schedule: '0 3 * * 1', lastRun: null },
    weekly_report: { enabled: true, schedule: '0 9 * * 0', lastRun: null },
    twitter_autopost: { enabled: false, schedule: 'on_publish', lastRun: null },
    reddit_autopost: { enabled: false, schedule: '0 10 * * *', lastRun: null },
  });
}

export async function saveAutomationConfig(config: any): Promise<void> {
  await safeWriteJson('automation_config.json', config);
}

// ─── 9. TOPICS REPOSITORY ────────────────────────────────────────────────────
export async function getTopics(): Promise<any[]> {
  return await safeReadJson<any[]>('topics.json', []);
}

export async function saveTopic(topic: any): Promise<any> {
  const topics = await getTopics();
  const idx = topics.findIndex((t: any) => t.id === topic.id);
  if (idx !== -1) {
    topics[idx] = { ...topics[idx], ...topic };
  } else {
    topics.push(topic);
  }
  await safeWriteJson('topics.json', topics);
  return topic;
}

export async function deleteTopic(id: string): Promise<void> {
  const topics = await getTopics();
  const filtered = topics.filter((t: any) => t.id !== id);
  await safeWriteJson('topics.json', filtered);
}

// ─── 10. ALERTS REPOSITORY ───────────────────────────────────────────────────
export async function getAlerts(): Promise<any[]> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      const dbAlerts = await db.alertLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      if (dbAlerts && dbAlerts.length > 0) return dbAlerts;
    } catch (err) {
      console.warn('[DataLayer] DB alerts error:', err);
    }
  }

  return await safeReadJson<any[]>('alerts.json', []);
}

export async function saveAlert(alert: { type: string; message: string; severity: string }): Promise<void> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.alertLog.create({
        data: {
          type: alert.type,
          message: alert.message,
          severity: alert.severity,
          resolved: false,
        },
      });
    } catch (err) {
      console.warn('[DataLayer] DB saveAlert error:', err);
    }
  }

  const alerts = await safeReadJson<any[]>('alerts.json', []);
  alerts.unshift({
    id: `alt-${Date.now()}`,
    type: alert.type,
    message: alert.message,
    severity: alert.severity,
    resolved: false,
    createdAt: new Date().toISOString(),
  });
  await safeWriteJson('alerts.json', alerts.slice(0, 50));
}

export async function resolveAlert(id: string): Promise<void> {
  const db = getPrisma();
  if (db && isDatabaseConnected()) {
    try {
      await db.alertLog.update({
        where: { id },
        data: { resolved: true },
      });
    } catch (err) {
      console.warn('[DataLayer] DB resolveAlert error:', err);
    }
  }

  const alerts = await safeReadJson<any[]>('alerts.json', []);
  const updated = alerts.map((a: any) => (a.id === id ? { ...a, resolved: true } : a));
  await safeWriteJson('alerts.json', updated);
}
