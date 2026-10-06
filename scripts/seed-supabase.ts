import fs from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), 'data');

async function seed() {
  console.log('🚀 Starting Supabase Database Migration & Sync...');

  // 1. Articles Migration
  try {
    const rawArticles = await fs.readFile(path.join(DATA_DIR, 'articles.json'), 'utf-8');
    const articles = JSON.parse(rawArticles);
    console.log(`📦 Found ${articles.length} articles to sync...`);
    let articleCount = 0;
    for (const a of articles) {
      const idStr = String(a.id);
      const niche = a.niche || (a.category === 'Crypto' ? 'crypto' : a.category === 'Finance' ? 'finance' : 'news');
      const slug = (a.slug || a.title || idStr).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      await prisma.article.upsert({
        where: { id: idStr },
        update: {
          title: a.title || 'Untitled',
          slug: slug,
          site: niche,
          category: a.category || (niche === 'crypto' ? 'Crypto' : niche === 'finance' ? 'Finance' : 'AI & Tech'),
          excerpt: a.excerpt || '',
          content: a.content || '',
          metaTitle: a.metaTitle || null,
          metaDescription: a.metaDescription || null,
          image: a.image || null,
          featured: Boolean(a.featured),
          status: a.status || 'published',
          qaStatus: a.qaStatus || 'approved',
          qaVerdict: a.qaVerdict || undefined,
          viewCount: Number(a.viewCount) || 0,
          publishAt: a.publishAt ? new Date(a.publishAt) : null,
          publishedAt: a.publishedAt ? new Date(a.publishedAt) : new Date(),
        },
        create: {
          id: idStr,
          title: a.title || 'Untitled',
          slug: slug,
          site: niche,
          category: a.category || (niche === 'crypto' ? 'Crypto' : niche === 'finance' ? 'Finance' : 'AI & Tech'),
          excerpt: a.excerpt || '',
          content: a.content || '',
          metaTitle: a.metaTitle || null,
          metaDescription: a.metaDescription || null,
          image: a.image || null,
          featured: Boolean(a.featured),
          status: a.status || 'published',
          qaStatus: a.qaStatus || 'approved',
          qaVerdict: a.qaVerdict || undefined,
          viewCount: Number(a.viewCount) || 0,
          publishAt: a.publishAt ? new Date(a.publishAt) : null,
          publishedAt: a.publishedAt ? new Date(a.publishedAt) : new Date(),
        },
      });
      articleCount++;
    }
    console.log(`✅ Synced ${articleCount} articles.`);
  } catch (err) {
    console.warn('⚠️ Articles migration skipped or failed:', err);
  }

  // 2. AdSlots Migration
  try {
    const rawSlots = await fs.readFile(path.join(DATA_DIR, 'adslots.json'), 'utf-8');
    const slots = JSON.parse(rawSlots);
    console.log(`📦 Found ${slots.length} ad slots to sync...`);
    for (const s of slots) {
      await prisma.adSlot.upsert({
        where: { id: s.id },
        update: {
          name: s.name,
          siteTargeting: s.siteTargeting || 'all',
          placement: s.placement || 'midFeed',
          type: s.type || 'house',
          adCode: s.adCode || null,
          headline: s.headline || null,
          description: s.description || null,
          ctaUrl: s.ctaUrl || null,
          weight: Number(s.weight) || 1,
          isActive: Boolean(s.isActive),
          requiresDisclosure: Boolean(s.requiresDisclosure),
          frequencyCapPerUser: Number(s.frequencyCapPerUser) || 0,
          priority: Number(s.priority) || 1,
        },
        create: {
          id: s.id,
          name: s.name,
          siteTargeting: s.siteTargeting || 'all',
          placement: s.placement || 'midFeed',
          type: s.type || 'house',
          adCode: s.adCode || null,
          headline: s.headline || null,
          description: s.description || null,
          ctaUrl: s.ctaUrl || null,
          weight: Number(s.weight) || 1,
          isActive: Boolean(s.isActive),
          requiresDisclosure: Boolean(s.requiresDisclosure),
          frequencyCapPerUser: Number(s.frequencyCapPerUser) || 0,
          priority: Number(s.priority) || 1,
        },
      });
    }
    console.log(`✅ Synced ${slots.length} ad slots.`);
  } catch (err) {
    console.warn('⚠️ Ad slots migration skipped:', err);
  }

  // 3. Settings Migration
  try {
    const rawSettings = await fs.readFile(path.join(DATA_DIR, 'settings.json'), 'utf-8');
    const settings = JSON.parse(rawSettings);
    for (const [key, value] of Object.entries(settings)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: value as any },
        create: { key, value: value as any },
      });
    }
    console.log(`✅ Synced settings.`);
  } catch (err) {
    console.warn('⚠️ Settings migration skipped:', err);
  }

  // 4. Pipeline State Migration
  try {
    const rawState = await fs.readFile(path.join(DATA_DIR, 'pipeline_state.json'), 'utf-8');
    const state = JSON.parse(rawState);
    for (const [step, data] of Object.entries(state as Record<string, any>)) {
      await prisma.pipelineStepState.upsert({
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
    console.log(`✅ Synced pipeline state.`);
  } catch (err) {
    console.warn('⚠️ Pipeline state migration skipped:', err);
  }

  // 5. Subscribers Migration
  try {
    const rawSubs = await fs.readFile(path.join(DATA_DIR, 'subscribers.json'), 'utf-8');
    const subs = JSON.parse(rawSubs);
    for (const s of subs) {
      await prisma.newsletterSubscriber.upsert({
        where: { email: s.email },
        update: { niche: s.niche || 'general' },
        create: { email: s.email, niche: s.niche || 'general' },
      });
    }
    console.log(`✅ Synced ${subs.length} newsletter subscribers.`);
  } catch (err) {
    console.warn('⚠️ Subscribers migration skipped:', err);
  }

  console.log('🎉 Supabase Database Migration & Sync complete!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
