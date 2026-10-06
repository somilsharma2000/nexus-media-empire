import { NextResponse } from 'next/server';
import { getArticles, saveArticle } from '@/lib/data-layer';

export async function POST(req: Request) {
  try {
    const { articleId, niche } = await req.json();
    const articles = await getArticles();

    const targetArticle = articles.find((a: any) => String(a.id) === String(articleId));
    if (!targetArticle) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    // Pick 3 related articles from same niche or cross-niche
    const related = articles
      .filter((a: any) => String(a.id) !== String(articleId) && (a.site === niche || a.niche === niche || a.status === 'published'))
      .slice(0, 3);

    if (related.length > 0 && !targetArticle.content?.includes('## Related Strategic Guides')) {
      const linkMarkdown = `\n\n---\n\n## Related Strategic Guides\n` +
        related.map((r: any) => `- [${r.title}](/${r.site || r.niche || 'news'}/${r.slug || r.id})`).join('\n') + '\n';
      
      targetArticle.content = (targetArticle.content || '') + linkMarkdown;
      await saveArticle(targetArticle);
      return NextResponse.json({ success: true, linksAdded: related.length });
    }

    return NextResponse.json({ success: true, linksAdded: 0, message: 'Links already present or no candidates' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process internal links' }, { status: 500 });
  }
}
