import { NextResponse } from 'next/server';
import { getArticles, getArticleById, saveArticle, saveArticles } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const article = await getArticleById(params.id);
  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  return NextResponse.json(article);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const article = await getArticleById(params.id);
    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    const updated = {
      ...article,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await saveArticle(updated);
    return NextResponse.json({ success: true, article: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const article = await getArticleById(params.id);
    if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    const updated = {
      ...article,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    if (body.status === 'published' && !updated.publishedAt) {
      updated.publishedAt = new Date().toISOString();
    }

    await saveArticle(updated);
    return NextResponse.json({ success: true, article: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to patch article' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    let articles = await getArticles();
    articles = articles.filter((a: any) => String(a.id) !== String(params.id) && a.slug !== params.id);
    await saveArticles(articles);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
