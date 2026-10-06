import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();
const DATA_DIR = path.join(process.cwd(), 'data');

async function readJsonFile<T>(filename: string, fallback: T): Promise<T> {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

export async function importAllJsonToDatabase() {
  console.log('🚀 Starting JSON -> PostgreSQL Database Import...');

  try {
    // 1. Articles
    const articles = await readJsonFile<any[]>('articles.json', []);
    console.log(`📦 Importing ${articles.length} articles...`);
    for (const a of articles) {
      const idStr = String(a.id);
      const slugStr = (a.slug || a.title || idStr).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      await prisma.article.upsert({
        where: { id: idStr },
        update: {
          title: a.title || 'Untitled',
          slug: slugStr,
          site: a.site || a.niche || a.category || 'news',
          category: a.category || 'Tech',
          excerpt: a.excerpt || '',
          content: a.content || '',
          metaTitle: a.metaTitle || null,
          metaDescription: a.metaDescription || null,
          image: a.image || null,
          featured: Boolean(a.featured),
          status: a.status || 'published',
          qaStatus: a.qaStatus || 'approved',
          qaVerdict: a.qaVerdict ? JSON.parse(JSON.stringify(a.qaVerdict)) : undefined,
          viewCount: typeof a.viewCount === 'number' ? a.viewCount : 0,
          publishedAt: a.publishedAt ? new Date(a.publishedAt) : (a.publishAt ? new Date(a.publishAt) : new Date()),
        },
        create: {
          id: idStr,
          title: a.title || 'Untitled',
          slug: slugStr,
          site: a.site || a.niche || a.category || 'news',
          category: a.category || 'Tech',
          excerpt: a.excerpt || '',
          content: a.content || '',
          metaTitle: a.metaTitle || null,
          metaDescription: a.metaDescription || null,
          image: a.image || null,
          featured: Boolean(a.featured),
          status: a.status || 'published',
          qaStatus: a.qaStatus || 'approved',
          qaVerdict: a.qaVerdict ? JSON.parse(JSON.stringify(a.qaVerdict)) : undefined,
          viewCount: typeof a.viewCount === 'number' ? a.viewCount : 0,
          publishedAt: a.publishedAt ? new Date(a.publishedAt) : (a.publishAt ? new Date(a.publishAt) : new Date()),
          createdAt: a.createdAt ? new Date(a.createdAt) : new Date(),
        },
      });
    }

    // 2. Topics
    const topics = await readJsonFile<any[]>('topics.json', []);
    console.log(`📦 Importing ${topics.length} topics...`);
    for (const t of topics) {
      const idStr = String(t.id);
      await prisma.topic.upsert({
        where: { id: idStr },
        update: {
          topic: t.topic,
          niche: t.niche || 'news',
          priority: t.priority || 'medium',
          isActive: t.isActive !== false,
          timesUsed: t.timesUsed || 0,
          lastUsed: t.lastUsed ? new Date(t.lastUsed) : null,
        },
        create: {
          id: idStr,
          topic: t.topic,
          niche: t.niche || 'news',
          priority: t.priority || 'medium',
          isActive: t.isActive !== false,
          timesUsed: t.timesUsed || 0,
          lastUsed: t.lastUsed ? new Date(t.lastUsed) : null,
        },
      });
    }

    // 3. Digital Products
    const products = await readJsonFile<any[]>('digital_products.json', []);
    console.log(`📦 Importing ${products.length} digital products...`);
    for (const p of products) {
      const idStr = String(p.id);
      await prisma.digitalProduct.upsert({
        where: { id: idStr },
        update: {
          name: p.name,
          niche: p.niche || 'news',
          price: Number(p.price) || 0,
          format: p.format || 'Digital Download',
          description: p.description || '',
          targetKeywords: p.targetKeywords || [],
          salesCount: Number(p.salesCount) || 0,
          revenue: Number(p.revenue) || 0,
          downloadUrl: p.downloadUrl || '',
          ctaText: p.ctaText || 'Get Access',
          isActive: p.isActive !== false,
        },
        create: {
          id: idStr,
          name: p.name,
          niche: p.niche || 'news',
          price: Number(p.price) || 0,
          format: p.format || 'Digital Download',
          description: p.description || '',
          targetKeywords: p.targetKeywords || [],
          salesCount: Number(p.salesCount) || 0,
          revenue: Number(p.revenue) || 0,
          downloadUrl: p.downloadUrl || '',
          ctaText: p.ctaText || 'Get Access',
          isActive: p.isActive !== false,
        },
      });
    }

    // 4. Sponsors
    const sponsors = await readJsonFile<any[]>('sponsors.json', []);
    console.log(`📦 Importing ${sponsors.length} sponsors...`);
    for (const s of sponsors) {
      const idStr = String(s.id);
      await prisma.sponsor.upsert({
        where: { id: idStr },
        update: {
          brandName: s.brandName,
          logoUrl: s.logoUrl || null,
          headline: s.headline || '',
          ctaText: s.ctaText || 'Learn More',
          ctaUrl: s.ctaUrl || '',
          placement: s.placement || 'header_takeover',
          niche: s.niche || 'all',
          cpm: Number(s.cpm) || 0,
          impressionsDelivered: Number(s.impressionsDelivered) || 0,
          active: s.active !== false,
          tier: s.tier || 'standard',
          startDate: s.startDate || null,
          endDate: s.endDate || null,
        },
        create: {
          id: idStr,
          brandName: s.brandName,
          logoUrl: s.logoUrl || null,
          headline: s.headline || '',
          ctaText: s.ctaText || 'Learn More',
          ctaUrl: s.ctaUrl || '',
          placement: s.placement || 'header_takeover',
          niche: s.niche || 'all',
          cpm: Number(s.cpm) || 0,
          impressionsDelivered: Number(s.impressionsDelivered) || 0,
          active: s.active !== false,
          tier: s.tier || 'standard',
          startDate: s.startDate || null,
          endDate: s.endDate || null,
        },
      });
    }

    // 5. CRM Customers
    const customers = await readJsonFile<any[]>('crm_customers.json', []);
    console.log(`📦 Importing ${customers.length} CRM customers...`);
    for (const c of customers) {
      const idStr = String(c.id);
      await prisma.crmCustomer.upsert({
        where: { id: idStr },
        update: {
          name: c.name,
          email: c.email,
          company: c.company || null,
          phone: c.phone || null,
          country: c.country || null,
          avatar: c.avatar || null,
          tier: c.tier || 'Standard',
          status: c.status || 'Active',
          totalSpentUsd: Number(c.totalSpentUsd) || 0,
          totalSpentInr: Number(c.totalSpentInr) || 0,
          ordersCount: Number(c.ordersCount) || 0,
          tags: c.tags || [],
          assignedRep: c.assignedRep || null,
          notes: c.notes || null,
          deals: c.deals || [],
        },
        create: {
          id: idStr,
          name: c.name,
          email: c.email,
          company: c.company || null,
          phone: c.phone || null,
          country: c.country || null,
          avatar: c.avatar || null,
          tier: c.tier || 'Standard',
          status: c.status || 'Active',
          totalSpentUsd: Number(c.totalSpentUsd) || 0,
          totalSpentInr: Number(c.totalSpentInr) || 0,
          ordersCount: Number(c.ordersCount) || 0,
          tags: c.tags || [],
          assignedRep: c.assignedRep || null,
          notes: c.notes || null,
          deals: c.deals || [],
        },
      });
    }

    // 6. Affiliate Links
    const affiliateLinks = await readJsonFile<any[]>('affiliate_links.json', []);
    console.log(`📦 Importing ${affiliateLinks.length} affiliate links...`);
    for (const aff of affiliateLinks) {
      const idStr = String(aff.id);
      await prisma.affiliateLink.upsert({
        where: { id: idStr },
        update: {
          name: aff.name,
          slug: aff.slug,
          affiliateUrl: aff.affiliateUrl,
          niche: aff.niche || 'crypto',
          commissionEstimate: aff.commissionEstimate || null,
          isActive: aff.isActive !== false,
        },
        create: {
          id: idStr,
          name: aff.name,
          slug: aff.slug,
          affiliateUrl: aff.affiliateUrl,
          niche: aff.niche || 'crypto',
          commissionEstimate: aff.commissionEstimate || null,
          isActive: aff.isActive !== false,
        },
      });
    }

    // 7. Ad Slots
    const adslots = await readJsonFile<any[]>('adslots.json', []);
    console.log(`📦 Importing ${adslots.length} ad slots...`);
    for (const slot of adslots) {
      const idStr = String(slot.id);
      await prisma.adSlot.upsert({
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
    }

    // 8. Backlinks
    const backlinks = await readJsonFile<any[]>('backlinks.json', []);
    console.log(`📦 Importing ${backlinks.length} backlinks...`);
    for (const bl of backlinks) {
      const idStr = String(bl.id);
      await prisma.backlink.upsert({
        where: { id: idStr },
        update: {
          platform: bl.platform,
          url: bl.url,
          articleTitle: bl.articleTitle || null,
          status: bl.status || 'active',
          clicks: Number(bl.clicks) || 0,
        },
        create: {
          id: idStr,
          platform: bl.platform,
          url: bl.url,
          articleTitle: bl.articleTitle || null,
          status: bl.status || 'active',
          clicks: Number(bl.clicks) || 0,
        },
      });
    }

    // 9. Meta Automations
    const metaAutomations = await readJsonFile<any[]>('meta_automations.json', []);
    console.log(`📦 Importing ${metaAutomations.length} meta automations...`);
    for (const auto of metaAutomations) {
      const idStr = String(auto.id);
      await prisma.metaAutomation.upsert({
        where: { id: idStr },
        update: {
          name: auto.name,
          niche: auto.niche || 'news',
          pageHandle: auto.pageHandle || 'TheTrendMatrix',
          triggerMode: auto.triggerMode || 'any_comment',
          triggerKeyword: auto.triggerKeyword || 'ANY',
          postType: auto.postType || 'instagram_carousel',
          targetUrl: auto.targetUrl || '',
          productId: auto.productId || null,
          dmsSent: Number(auto.dmsSent) || 0,
          conversions: Number(auto.conversions) || 0,
          isActive: auto.isActive !== false,
          requireFollow: auto.requireFollow !== false,
          step1FollowRequestDm: auto.step1FollowRequestDm || null,
          step2PayloadDm: auto.step2PayloadDm || null,
          publicCommentReply: auto.publicCommentReply || null,
        },
        create: {
          id: idStr,
          name: auto.name,
          niche: auto.niche || 'news',
          pageHandle: auto.pageHandle || 'TheTrendMatrix',
          triggerMode: auto.triggerMode || 'any_comment',
          triggerKeyword: auto.triggerKeyword || 'ANY',
          postType: auto.postType || 'instagram_carousel',
          targetUrl: auto.targetUrl || '',
          productId: auto.productId || null,
          dmsSent: Number(auto.dmsSent) || 0,
          conversions: Number(auto.conversions) || 0,
          isActive: auto.isActive !== false,
          requireFollow: auto.requireFollow !== false,
          step1FollowRequestDm: auto.step1FollowRequestDm || null,
          step2PayloadDm: auto.step2PayloadDm || null,
          publicCommentReply: auto.publicCommentReply || null,
        },
      });
    }

    // 10. Email Templates
    const emailTemplates = await readJsonFile<any[]>('email_templates.json', []);
    console.log(`📦 Importing ${emailTemplates.length} email templates...`);
    for (const tmpl of emailTemplates) {
      const idStr = String(tmpl.id);
      await prisma.emailTemplate.upsert({
        where: { id: idStr },
        update: {
          name: tmpl.name,
          subject: tmpl.subject,
          category: tmpl.category || 'general',
          htmlContent: tmpl.htmlContent || tmpl.html || '',
          textContent: tmpl.textContent || tmpl.text || null,
          variables: tmpl.variables || [],
        },
        create: {
          id: idStr,
          name: tmpl.name,
          subject: tmpl.subject,
          category: tmpl.category || 'general',
          htmlContent: tmpl.htmlContent || tmpl.html || '',
          textContent: tmpl.textContent || tmpl.text || null,
          variables: tmpl.variables || [],
        },
      });
    }

    // 11. Pipeline Step States
    const pipelineState = await readJsonFile<Record<string, any>>('pipeline_state.json', {});
    console.log(`📦 Importing pipeline states...`);
    for (const [step, data] of Object.entries(pipelineState)) {
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

    console.log('✅ ALL JSON DATA SUCCESSFULLY IMPORTED INTO POSTGRESQL/PRISMA!');
  } catch (error) {
    console.error('❌ Error during import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  importAllJsonToDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
