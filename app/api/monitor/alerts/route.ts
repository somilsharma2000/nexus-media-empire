import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const alertsFilePath = path.join(process.cwd(), 'data', 'alerts.json');

interface Alert {
  id: string;
  type: string;
  message: string;
  severity: string;
  resolved: boolean;
  createdAt: string;
}

async function readAlerts(): Promise<Alert[]> {
  try {
    await fs.mkdir(path.dirname(alertsFilePath), { recursive: true });
    const raw = await fs.readFile(alertsFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeAlerts(alerts: Alert[]): Promise<void> {
  await fs.writeFile(alertsFilePath, JSON.stringify(alerts, null, 2));
}

export async function GET() {
  const alerts = await readAlerts();
  const sorted = [...alerts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);
  return NextResponse.json(sorted);
}

export async function PATCH(request: Request) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const alerts = await readAlerts();
  const idx = alerts.findIndex((a) => a.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
  }

  alerts[idx].resolved = true;
  await writeAlerts(alerts);
  return NextResponse.json({ success: true, alert: alerts[idx] });
}
