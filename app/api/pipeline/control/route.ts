import { NextResponse } from 'next/server';
import { readState, writeState, log } from '@/lib/pipeline-helpers';
import { verifyAdminAuth, unauthorizedResponse } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const isAuth = await verifyAdminAuth(req);
  if (!isAuth) {
    return unauthorizedResponse();
  }

  const body = await req.json();
  const { step, action } = body as { step: string; action: 'pause' | 'resume' };

  if (!step || !['pause', 'resume'].includes(action)) {
    return NextResponse.json(
      { error: 'Invalid body. Required: { step: string, action: "pause" | "resume" }' },
      { status: 400 }
    );
  }

  const state = await readState();

  if (!state[step]) {
    return NextResponse.json({ error: `Unknown step: ${step}` }, { status: 404 });
  }

  const newStatus = action === 'pause' ? 'paused' : 'active';
  state[step].status = newStatus;
  if (action === 'resume') {
    state[step].consecutiveFailures = 0;
  }

  await writeState(state);
  await log('control', 'info', `Step "${step}" was ${newStatus} via control API`);

  return NextResponse.json({ success: true, step, status: newStatus });
}
