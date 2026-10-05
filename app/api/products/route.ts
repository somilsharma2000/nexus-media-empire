import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'digital_products.json');

function getProducts() {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveProducts(products: unknown[]) {
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf-8');
}

export async function GET() {
  const products = getProducts();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const products = getProducts();
    const newProduct = {
      id: `dp-${Date.now()}`,
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
    products.push(newProduct);
    saveProducts(products);
    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const products = getProducts();
    const index = products.findIndex((p: { id: string }) => p.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    products[index] = { ...products[index], ...body };
    saveProducts(products);
    return NextResponse.json({ success: true, product: products[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    let products = getProducts();
    products = products.filter((p: { id: string }) => p.id !== id);
    saveProducts(products);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
