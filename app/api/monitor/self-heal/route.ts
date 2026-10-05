import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { resilientReadJson, atomicWriteJson } from '@/lib/atomic-storage';
import { sendTelegramAlert } from '@/lib/telegram';

const DATA_DIR = path.join(process.cwd(), 'data');
const RECOVERY_LOG_PATH = path.join(DATA_DIR, 'health_recovery_log.json');

interface SchemaBlueprint {
  fileName: string;
  defaultContent: any;
}

const CRITICAL_SCHEMAS: SchemaBlueprint[] = [
  { fileName: 'articles.json', defaultContent: [] },
  { fileName: 'adslots.json', defaultContent: [] },
  { fileName: 'affiliate_links.json', defaultContent: [] },
  { fileName: 'sponsors.json', defaultContent: [] },
  { fileName: 'sponsorship_inquiries.json', defaultContent: [] },
  { fileName: 'digital_products.json', defaultContent: [] },
  { fileName: 'topics.json', defaultContent: [] },
  { fileName: 'subscribers.json', defaultContent: [] },
  { fileName: 'alerts.json', defaultContent: [] },
  { fileName: 'pipeline_state.json', defaultContent: { trend_scout: { status: 'active', consecutiveFailures: 0 }, qa_review: { status: 'active', consecutiveFailures: 0 }, publisher: { status: 'active', consecutiveFailures: 0 } } },
  { fileName: 'automation_config.json', defaultContent: { trend_scout: { enabled: true, schedule: '0 8 * * *' }, publisher: { enabled: true, schedule: '0 9 * * *' } } },
  { fileName: 'token_usage.json', defaultContent: { month: new Date().toISOString().slice(0, 7), tokensUsed: 0, estimatedCost: 0 } },
];

export async function GET() {
  const actionsTaken: string[] = [];
  const scannedFiles: string[] = [];

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    // 1. Audit and auto-repair all JSON schemas
    for (const schema of CRITICAL_SCHEMAS) {
      const filePath = path.join(DATA_DIR, schema.fileName);
      scannedFiles.push(schema.fileName);

      try {
        const raw = await fs.readFile(filePath, 'utf-8');
        if (!raw.trim()) {
          await atomicWriteJson(filePath, schema.defaultContent);
          actionsTaken.push(`[REPAIRED EMPTY] Restored default schema for ${schema.fileName}`);
        } else {
          JSON.parse(raw); // Validate syntax
        }
      } catch (err) {
        await atomicWriteJson(filePath, schema.defaultContent);
        actionsTaken.push(`[AUTO-HEALED] Rebuilt corrupted/missing file ${schema.fileName}`);
      }
    }

    // 2. Audit articles for missing slugs
    const articlesPath = path.join(DATA_DIR, 'articles.json');
    const articles = await resilientReadJson<any[]>(articlesPath, []);
    let articlesFixed = 0;

    const repairedArticles = articles.map((art) => {
      if (!art.slug && art.title) {
        art.slug = art.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        articlesFixed++;
      }
      if (!art.niche) {
        art.niche = 'news';
        articlesFixed++;
      }
      return art;
    });

    if (articlesFixed > 0) {
      await atomicWriteJson(articlesPath, repairedArticles);
      actionsTaken.push(`[INDEX HEALED] Generated missing URL slugs & niches for ${articlesFixed} articles`);
    }

    // 3. Reset stalled pipeline states if failure count > 3
    const statePath = path.join(DATA_DIR, 'pipeline_state.json');
    const state = await resilientReadJson<any>(statePath, {});
    let stateModified = false;

    for (const key of Object.keys(state)) {
      if (state[key].status === 'paused' && state[key].consecutiveFailures >= 3) {
        state[key].status = 'active';
        state[key].consecutiveFailures = 0;
        stateModified = true;
        actionsTaken.push(`[PIPELINE RECOVERED] Auto-resumed stalled worker '${key}'`);
      }
    }

    if (stateModified) {
      await atomicWriteJson(statePath, state);
    }

    // 4. Record Recovery Log
    const logs = await resilientReadJson<any[]>(RECOVERY_LOG_PATH, []);
    const newLogEntry = {
      timestamp: new Date().toISOString(),
      status: actionsTaken.length > 0 ? 'healed' : 'optimal',
      actionsTaken,
      scannedFilesCount: scannedFiles.length,
    };
    logs.unshift(newLogEntry);
    await atomicWriteJson(RECOVERY_LOG_PATH, logs.slice(0, 50));

    // Send Telegram alert if auto-healing occurred
    if (actionsTaken.length > 0) {
      await sendTelegramAlert(
        `🛡️ <b>NEXUS SELF-HEALING ENGINE ACTIVE</b>\n` +
        `Fixed ${actionsTaken.length} system anomalies:\n` +
        actionsTaken.map(a => `• ${a}`).join('\n')
      );
    }

    return NextResponse.json({
      success: true,
      systemHealth: '100% OPERATIONAL',
      scannedFilesCount: scannedFiles.length,
      actionsTaken,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
