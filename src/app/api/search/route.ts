import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { SYSTEM_NAVIGATION_COMMANDS, SYSTEM_ACTION_COMMANDS, SearchResultItem } from "@/core/search/command-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";
    const orgId = searchParams.get("orgId");

    const results: SearchResultItem[] = [];

    // Match Action & Navigation Commands
    if (query.startsWith("/")) {
      const cmd = query.toLowerCase();
      const matchedActions = SYSTEM_ACTION_COMMANDS.filter(
        (a) => a.title.toLowerCase().includes(cmd.slice(1)) || a.subtitle.toLowerCase().includes(cmd)
      );
      const matchedNavs = SYSTEM_NAVIGATION_COMMANDS.filter(
        (n) => n.title.toLowerCase().includes(cmd.slice(1)) || n.subtitle.toLowerCase().includes(cmd)
      );
      return NextResponse.json([...matchedActions, ...matchedNavs]);
    }

    // Always include top navigation commands if query is short or matches
    const matchedNavs = SYSTEM_NAVIGATION_COMMANDS.filter(
      (n) => !query || n.title.toLowerCase().includes(query.toLowerCase()) || n.subtitle.toLowerCase().includes(query.toLowerCase())
    );
    results.push(...matchedNavs);

    const matchedActions = SYSTEM_ACTION_COMMANDS.filter(
      (a) => !query || a.title.toLowerCase().includes(query.toLowerCase()) || a.subtitle.toLowerCase().includes(query.toLowerCase())
    );
    results.push(...matchedActions);

    if (!query) {
      return NextResponse.json(results);
    }

    // Get Active Organization ID
    const organization = orgId
      ? await prisma.organization.findUnique({ where: { id: orgId } })
      : await prisma.organization.findFirst();

    if (!organization) {
      return NextResponse.json(results);
    }

    const currentOrgId = organization.id;

    // 1. Search Contacts
    const contacts = await prisma.contact.findMany({
      where: {
        organizationId: currentOrgId,
        OR: [
          { name: { contains: query } },
          { companyName: { contains: query } },
          { email: { contains: query } },
          { phone: { contains: query } },
        ],
      },
      take: 4,
    });

    for (const c of contacts) {
      results.push({
        id: `contact-${c.id}`,
        type: "contact",
        title: c.name,
        subtitle: `${c.companyName ? c.companyName + " • " : ""}${c.email || c.phone || "Contact"}`,
        badge: c.isCustomer ? "Customer" : "Vendor",
        badgeColor: "bg-blue-100 text-blue-800",
        url: `/contacts?id=${c.id}`,
        iconName: "User",
      });
    }

    // 2. Search Leads & Opportunities
    const leads = await prisma.lead.findMany({
      where: {
        organizationId: currentOrgId,
        OR: [
          { name: { contains: query } },
          { companyName: { contains: query } },
          { contactName: { contains: query } },
          { email: { contains: query } },
        ],
      },
      include: { stage: true },
      take: 4,
    });

    for (const l of leads) {
      results.push({
        id: `lead-${l.id}`,
        type: "lead",
        title: l.name,
        subtitle: `${l.companyName ? l.companyName + " • " : ""}₹${l.expectedRevenue.toLocaleString("en-IN")}`,
        badge: l.stage?.name || "Lead",
        badgeColor: "bg-indigo-100 text-indigo-800",
        url: `/crm?id=${l.id}`,
        iconName: "Target",
      });
    }

    // 3. Search Invoices
    const invoices = await prisma.invoice.findMany({
      where: {
        organizationId: currentOrgId,
        OR: [
          { invoiceNumber: { contains: query } },
          { customer: { name: { contains: query } } },
        ],
      },
      include: { customer: true },
      take: 4,
    });

    for (const inv of invoices) {
      results.push({
        id: `invoice-${inv.id}`,
        type: "invoice",
        title: inv.invoiceNumber,
        subtitle: `${inv.customer?.name} • ₹${inv.totalAmount.toLocaleString("en-IN")}`,
        badge: inv.status.toUpperCase(),
        badgeColor: inv.status === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
        url: `/invoices?id=${inv.id}`,
        iconName: "Receipt",
      });
    }

    // 4. Search Quotations
    const quotations = await prisma.quotation.findMany({
      where: {
        organizationId: currentOrgId,
        OR: [
          { quotationNumber: { contains: query } },
          { customer: { name: { contains: query } } },
        ],
      },
      include: { customer: true },
      take: 4,
    });

    for (const q of quotations) {
      results.push({
        id: `quotation-${q.id}`,
        type: "quotation",
        title: q.quotationNumber,
        subtitle: `${q.customer?.name} • ₹${q.totalAmount.toLocaleString("en-IN")}`,
        badge: q.status.toUpperCase(),
        badgeColor: "bg-purple-100 text-purple-800",
        url: `/sales?id=${q.id}`,
        iconName: "FileText",
      });
    }

    // 5. Search Products
    const products = await prisma.product.findMany({
      where: {
        organizationId: currentOrgId,
        OR: [
          { name: { contains: query } },
          { sku: { contains: query } },
          { hsnCode: { contains: query } },
        ],
      },
      take: 4,
    });

    for (const p of products) {
      results.push({
        id: `product-${p.id}`,
        type: "product",
        title: p.name,
        subtitle: `SKU: ${p.sku} • ₹${p.sellingPrice.toLocaleString("en-IN")}`,
        badge: `${p.stockOnHand} In Stock`,
        badgeColor: "bg-emerald-100 text-emerald-800",
        url: `/products?id=${p.id}`,
        iconName: "Package",
      });
    }

    // 6. Search Tasks
    const tasks = await prisma.task.findMany({
      where: {
        organizationId: currentOrgId,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      include: { project: true },
      take: 4,
    });

    for (const t of tasks) {
      results.push({
        id: `task-${t.id}`,
        type: "task",
        title: t.title,
        subtitle: t.project?.name || "Task",
        badge: t.priority,
        badgeColor: t.priority === "Urgent" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800",
        url: `/projects?taskId=${t.id}`,
        iconName: "CheckSquare",
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to execute search" }, { status: 500 });
  }
}
