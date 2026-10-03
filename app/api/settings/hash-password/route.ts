import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    const hash = await bcrypt.hash(password, 10);
    return NextResponse.json({ hash });
  } catch (error) {
    console.error('Hash error:', error);
    return NextResponse.json({ error: 'Failed to hash password' }, { status: 500 });
  }
}
