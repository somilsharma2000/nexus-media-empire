import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const ARTICLES_PATH = path.join(process.cwd(), 'data', 'articles.json');

async function readArticles(): Promise<any[]> {
  try {
    const raw = await fs.readFile(ARTICLES_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeArticles(articles: any[]) {
  await fs.writeFile(ARTICLES_PATH, JSON.stringify(articles, null, 2));
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const articles = await readArticles();
  const article = articles.find((a) => a.id === params.id || a.slug === params.id);
  if (!article) return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  return NextResponse.json(article);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const articles = await readArticles();
    const idx = articles.findIndex((a) => a.id === params.id || a.slug === params.id);
    if (idx === -1) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    articles[idx] = {
      ...articles[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await writeArticles(articles);
    return NextResponse.json({ success: true, article: articles[idx] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const articles = await readArticles();
    const idx = articles.findIndex((a) => a.id === params.id || a.slug === params.id);
    if (idx === -1) return NextResponse.json({ error: 'Article not found' }, { status: 404 });

    if (body.status === 'published' && !articles[idx].publishedAt) {
      articles[idx].publishedAt = new Date().toISOString();
    }

    articles[idx] = {
      ...articles[idx],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    await writeArticles(articles);
    return NextResponse.json({ success: true, article: articles[idx] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to patch article' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    let articles = await readArticles();
    articles = articles.filter((a) => a.id !== params.id && a.slug !== params.id);
    await writeArticles(articles);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
