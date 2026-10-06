import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const TEMPLATES_PATH = path.join(process.cwd(), "data", "email_templates.json");

function getTemplates() {
  try {
    if (!fs.existsSync(TEMPLATES_PATH)) return [];
    return JSON.parse(fs.readFileSync(TEMPLATES_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function saveTemplates(data: any[]) {
  try {
    fs.writeFileSync(TEMPLATES_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("[TEMPLATES SAVE ERROR]", err);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const entity = searchParams.get("entity");

    let templates = getTemplates();
    if (entity && entity !== "all") {
      templates = templates.filter((t: any) => t.entity.toLowerCase() === entity.toLowerCase());
    }

    return NextResponse.json({ success: true, templates });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, entity, category, subject, preheader, htmlTemplate, variables } = body;

    if (!name || !subject || !htmlTemplate) {
      return NextResponse.json({ success: false, error: "Name, Subject, and HTML Template are required" }, { status: 400 });
    }

    const current = getTemplates();
    let saved;

    if (id) {
      const idx = current.findIndex((t: any) => t.id === id);
      if (idx !== -1) {
        current[idx] = { ...current[idx], name, entity, category, subject, preheader, htmlTemplate, variables };
        saved = current[idx];
      }
    } else {
      saved = {
        id: `tpl_${Date.now()}`,
        name,
        entity: entity || "General",
        category: category || "Communication",
        subject,
        preheader: preheader || "",
        htmlTemplate,
        variables: variables || []
      };
      current.unshift(saved);
    }

    saveTemplates(current);
    return NextResponse.json({ success: true, template: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
