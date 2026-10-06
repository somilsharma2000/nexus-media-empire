import { NextResponse } from 'next/server';
import { dispatchSystemAlert, SystemIncidentAlert } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { source = 'pipeline', severity = 'warning', title = 'Manual Incident Test', message = 'Triggered system health alert test', metadata } = body as SystemIncidentAlert;

    const result = await dispatchSystemAlert({
      source,
      severity,
      title,
      message,
      metadata,
    });

    return NextResponse.json({
      success: true,
      message: 'Alert dispatched across all configured channels',
      dispatchedTo: result.dispatchedTo,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to dispatch alert' }, { status: 500 });
  }
}
