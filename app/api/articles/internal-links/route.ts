import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ARTICLES_PATH = path.join(process.cwd(), 'data', 'articles.json');

export async function POST(req: Request) {
  try {
    const { articleId, niche } = await req.json();
    const raw = await fs.readFile(ARTICLES_PATH, 'utf-8');
    const articles = JSON.parse(raw);

    const targetArticle = articles.find((a: any) => a.id === articleId);
    if (!targetArticle) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    // Pick 3 related articles from same niche or cross-niche
    const related = articles
      .filter((a: any) => a.id !== articleId && (a.niche === niche || a.status === 'published'))
      .slice(0, 3);

    if (related.length > 0 && !targetArticle.content.includes('## Related Strategic Guides')) {
      const linkMarkdown = `\n\n---\n\n## Related Strategic Guides\n` +
        related.map((r: any) => `- [${r.title}](/${r.niche}/${r.slug})`).join('\n') + '\n';
      
      targetArticle.content += linkMarkdown;
      await fs.writeFile(ARTICLES_PATH, JSON.stringify(articles, null, 2));
      return NextResponse.json({ success: true, linksAdded: related.length });
    }

    return NextResponse.json({ success: true, linksAdded: 0, message: 'Links already present or no candidates' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process internal links' }, { status: 500 });
  }
}
