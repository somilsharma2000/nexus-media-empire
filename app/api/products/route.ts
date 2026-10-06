import { NextResponse } from 'next/server';
import { getDigitalProducts, saveDigitalProduct, deleteDigitalProduct } from '@/lib/data-layer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await getDigitalProducts();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newProduct = {
      id: body.id || `dp-${Date.now()}`,
      name: body.name || 'New Digital Product',
      niche: body.niche || 'all',
      price: Number(body.price) || 29,
      format: body.format || 'PDF Guide',
      description: body.description || '',
      targetKeywords: body.targetKeywords || [],
      salesCount: 0,
      revenue: 0,
      downloadUrl: body.downloadUrl || '#',
      ctaText: body.ctaText || 'Download Now',
      isActive: true
    };
    await saveDigitalProduct(newProduct);
    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Product id required' }, { status: 400 });
    }
    const updated = await saveDigitalProduct(body);
    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await deleteDigitalProduct(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

