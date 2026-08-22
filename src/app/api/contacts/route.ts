import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSecurityContext } from "@/lib/auth";
import { buildPrismaRecordFilter, evaluatePermission } from "@/core/security/permission-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const contactId = searchParams.get("id");

    const sec = await getSecurityContext(orgId);
    if (!sec) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!evaluatePermission(sec, "contacts", "view")) {
      return NextResponse.json({ error: "Access Denied: You cannot view contacts." }, { status: 403 });
    }

    if (contactId) {
      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
        include: {
          quotations: { orderBy: { createdAt: "desc" } },
          invoices: { orderBy: { createdAt: "desc" } },
          payments: { orderBy: { createdAt: "desc" } },
          projects: true,
        },
      });
      return NextResponse.json(contact);
    }

    const scopeFilter = buildPrismaRecordFilter(sec, "contacts");

    const contacts = await prisma.contact.findMany({
      where: scopeFilter,
      include: {
        _count: {
          select: { quotations: true, invoices: true, projects: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("Contacts GET error:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      companyName,
      type,
      email,
      phone,
      mobile,
      isCustomer,
      isVendor,
      gstin,
      pan,
      website,
      street,
      city,
      state,
      postalCode,
      country,
      creditLimit,
      tags,
      notes,
      orgId,
      branchId,
    } = body;

    const sec = await getSecurityContext(orgId);
    if (!sec) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!evaluatePermission(sec, "contacts", "create")) {
      return NextResponse.json({ error: "Access Denied: You cannot create contacts." }, { status: 403 });
    }

    const contact = await prisma.contact.create({
      data: {
        organizationId: sec.organizationId,
        branchId: branchId || sec.branchId || null,
        name,
        companyName,
        type: type || "individual",
        email,
        phone,
        mobile,
        isCustomer: isCustomer ?? true,
        isVendor: isVendor ?? false,
        gstin,
        pan,
        website,
        street,
        city,
        state,
        postalCode,
        country: country || "India",
        creditLimit: Number(creditLimit) || 0,
        tags,
        notes,
        ownerUserId: sec.userId,
        department: sec.department || null,
        team: sec.team || null,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Contacts POST error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
