import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WEBHOOK_LOGS_PATH = path.join(process.cwd(), "data", "webhook_logs.json");

export async function GET() {
  try {
    if (!fs.existsSync(WEBHOOK_LOGS_PATH)) {
      return NextResponse.json({ success: true, logs: [] });
    }
    const logs = JSON.parse(fs.readFileSync(WEBHOOK_LOGS_PATH, "utf-8"));
    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
