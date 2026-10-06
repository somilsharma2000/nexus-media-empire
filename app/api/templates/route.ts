import { NextResponse } from "next/server";
import { getEmailTemplates, saveEmailTemplate, deleteEmailTemplate } from "@/lib/data-layer";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const entity = searchParams.get("entity");

    let templates = await getEmailTemplates();
    if (entity && entity !== "all") {
      templates = templates.filter((t: any) => t.entity?.toLowerCase() === entity.toLowerCase());
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

    const saved = {
      id: id || `tpl_${Date.now()}`,
      name,
      entity: entity || "General",
      category: category || "Communication",
      subject,
      preheader: preheader || "",
      htmlTemplate,
      variables: variables || []
    };

    await saveEmailTemplate(saved);
    return NextResponse.json({ success: true, template: saved });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });

    await deleteEmailTemplate(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

