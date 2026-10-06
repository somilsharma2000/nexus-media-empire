import { NextResponse } from "next/server";
import { getWebhookLogs } from "@/lib/data-layer";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const logs = await getWebhookLogs();
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

