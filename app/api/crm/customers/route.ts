import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CRM_PATH = path.join(process.cwd(), "data", "crm_customers.json");

function getCustomers() {
  try {
    if (!fs.existsSync(CRM_PATH)) return [];
    return JSON.parse(fs.readFileSync(CRM_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function saveCustomers(data: any[]) {
  try {
    fs.writeFileSync(CRM_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("[CRM SAVE ERROR]", err);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tier = searchParams.get("tier");
    const status = searchParams.get("status");
    const query = searchParams.get("q")?.toLowerCase();

    let customers = getCustomers();

    if (tier && tier !== "all") {
      customers = customers.filter((c: any) => c.tier.toLowerCase() === tier.toLowerCase());
    }

    if (status && status !== "all") {
      customers = customers.filter((c: any) => c.status.toLowerCase() === status.toLowerCase());
    }

    if (query) {
      customers = customers.filter((c: any) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.company.toLowerCase().includes(query) ||
        (c.tags && c.tags.some((t: string) => t.toLowerCase().includes(query)))
      );
    }

    const totalLtvUsd = customers.reduce((acc: number, c: any) => acc + (Number(c.totalSpentUsd) || 0), 0);
    const totalLtvInr = customers.reduce((acc: number, c: any) => acc + (Number(c.totalSpentInr) || 0), 0);
    const vipCount = customers.filter((c: any) => c.tier.includes("VIP") || c.tier.includes("Enterprise")).length;

    return NextResponse.json({
      success: true,
      customers,
      stats: {
        totalCustomers: customers.length,
        totalLtvUsd,
        totalLtvInr,
        vipCount,
        averageOrderValueUsd: customers.length ? Math.round(totalLtvUsd / customers.length) : 0
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, email, company, phone, country, tier, status, notes, tags } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, error: "Name and Email are required" }, { status: 400 });
    }

    const current = getCustomers();
    let updatedCustomer;

    if (id) {
      const idx = current.findIndex((c: any) => c.id === id);
      if (idx !== -1) {
        current[idx] = {
          ...current[idx],
          name,
          email,
          company: company || current[idx].company,
          phone: phone || current[idx].phone,
          country: country || current[idx].country,
          tier: tier || current[idx].tier,
          status: status || current[idx].status,
          notes: notes !== undefined ? notes : current[idx].notes,
          tags: tags || current[idx].tags,
          lastActive: new Date().toISOString()
        };
        updatedCustomer = current[idx];
      }
    } else {
      updatedCustomer = {
        id: `crm_cust_${Date.now()}`,
        name,
        email,
        company: company || "Independent Client",
        phone: phone || "",
        country: country || "United States",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
        tier: tier || "Warm Lead",
        status: status || "Active",
        totalSpentUsd: 0,
        totalSpentInr: 0,
        ordersCount: 0,
        lastActive: new Date().toISOString(),
        tags: tags || ["New Customer"],
        assignedRep: "Nexus Executive Desk",
        notes: notes || "",
        deals: []
      };
      current.unshift(updatedCustomer);
    }

    saveCustomers(current);
    return NextResponse.json({ success: true, customer: updatedCustomer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });

    const current = getCustomers();
    const filtered = current.filter((c: any) => c.id !== id);
    saveCustomers(filtered);

    return NextResponse.json({ success: true, remainingCount: filtered.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
