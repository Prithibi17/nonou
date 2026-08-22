import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const contactId = searchParams.get("id");

    const org = orgId
      ? await prisma.organization.findUnique({ where: { id: orgId } })
      : await prisma.organization.findFirst();

    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

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

    const contacts = await prisma.contact.findMany({
      where: { organizationId: org.id },
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

    const org = orgId
      ? await prisma.organization.findUnique({ where: { id: orgId } })
      : await prisma.organization.findFirst();

    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const contact = await prisma.contact.create({
      data: {
        organizationId: org.id,
        branchId: branchId || null,
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
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Contacts POST error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
