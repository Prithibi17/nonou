import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSecurityContext } from "@/lib/auth";
import { buildPrismaRecordFilter, evaluatePermission } from "@/core/security/permission-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const branchId = searchParams.get("branchId");

    const sec = await getSecurityContext(orgId);
    if (!sec) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!evaluatePermission(sec, "sales", "view")) {
      return NextResponse.json({ error: "Access Denied: You cannot view sales quotations." }, { status: 403 });
    }

    const scopeFilter = buildPrismaRecordFilter(sec, "sales");
    if (branchId) scopeFilter.branchId = branchId;

    const quotations = await prisma.quotation.findMany({
      where: scopeFilter,
      include: {
        customer: true,
        lines: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const customers = await prisma.contact.findMany({
      where: { organizationId: sec.organizationId, isCustomer: true },
      select: { id: true, name: true, companyName: true, email: true, phone: true, gstin: true },
    });

    const products = await prisma.product.findMany({
      where: { organizationId: sec.organizationId, isActive: true },
      select: { id: true, name: true, sku: true, sellingPrice: true, taxRate: true, hsnCode: true },
    });

    return NextResponse.json({ quotations, customers, products });
  } catch (error) {
    console.error("Sales GET error:", error);
    return NextResponse.json({ error: "Failed to fetch sales data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerId,
      issueDate,
      expiryDate,
      paymentTerms,
      notes,
      termsAndConditions,
      lines,
      orgId,
      branchId,
    } = body;

    const sec = await getSecurityContext(orgId);
    if (!sec) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!evaluatePermission(sec, "sales", "create")) {
      return NextResponse.json({ error: "Access Denied: You cannot create quotations." }, { status: 403 });
    }

    // Generate Quotation Number
    const count = await prisma.quotation.count({ where: { organizationId: sec.organizationId } });
    const currentYear = new Date().getFullYear();
    const quotationNumber = `QT-${currentYear}-${String(count + 1).padStart(4, "0")}`;

    // Calculate Totals
    let subtotal = 0;
    let taxAmount = 0;

    const processedLines = (lines || []).map((line: any) => {
      const qty = Number(line.quantity) || 1;
      const price = Number(line.unitPrice) || 0;
      const discount = Number(line.discountPercent) || 0;
      const taxRate = Number(line.taxRate) || 18;

      const baseAmount = qty * price * (1 - discount / 100);
      const lineTax = (baseAmount * taxRate) / 100;
      const lineTotal = baseAmount + lineTax;

      subtotal += baseAmount;
      taxAmount += lineTax;

      return {
        productId: line.productId || null,
        description: line.description || "Product item",
        quantity: qty,
        unitPrice: price,
        discountPercent: discount,
        taxRate: taxRate,
        taxAmount: lineTax,
        lineTotal: lineTotal,
      };
    });

    const totalAmount = subtotal + taxAmount;

    const quotation = await prisma.quotation.create({
      data: {
        organizationId: sec.organizationId,
        branchId: branchId || sec.branchId || null,
        quotationNumber,
        customerId,
        status: "draft",
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        paymentTerms: paymentTerms || "Immediate",
        subtotal,
        taxAmount,
        discountAmount: 0,
        totalAmount,
        notes,
        termsAndConditions,
        ownerUserId: sec.userId,
        department: sec.department || null,
        team: sec.team || null,
        createdById: sec.userId,
        lines: {
          create: processedLines,
        },
      },
      include: {
        customer: true,
        lines: { include: { product: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        organizationId: sec.organizationId,
        recordType: "quotation",
        recordId: quotation.id,
        action: "create",
        fieldName: "quotationNumber",
        newValue: quotation.quotationNumber,
        userId: sec.userId,
      },
    });

    return NextResponse.json(quotation);
  } catch (error) {
    console.error("Sales POST error:", error);
    return NextResponse.json({ error: "Failed to create quotation" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, action, status } = body;

    const sec = await getSecurityContext();
    if (!sec) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.quotation.findUnique({
      where: { id },
      include: { lines: true, customer: true },
    });

    if (!existing) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

    if (!evaluatePermission(sec, "sales", "edit", existing)) {
      return NextResponse.json({ error: "Access Denied: You cannot modify this quotation." }, { status: 403 });
    }

    // Handle 1-Click Convert to Invoice
    if (action === "convert_to_invoice") {
      if (!evaluatePermission(sec, "invoices", "create")) {
        return NextResponse.json({ error: "Access Denied: You do not have permission to create invoices." }, { status: 403 });
      }

      const invCount = await prisma.invoice.count({ where: { organizationId: existing.organizationId } });
      const currentYear = new Date().getFullYear();
      const invoiceNumber = `INV-${currentYear}-${String(invCount + 1).padStart(4, "0")}`;

      const isLocal = existing.customer.state?.toLowerCase().includes("karnataka");
      const cgst = isLocal ? existing.taxAmount / 2 : 0;
      const sgst = isLocal ? existing.taxAmount / 2 : 0;
      const igst = !isLocal ? existing.taxAmount : 0;

      const invoice = await prisma.invoice.create({
        data: {
          organizationId: existing.organizationId,
          branchId: existing.branchId,
          invoiceNumber,
          customerId: existing.customerId,
          quotationId: existing.id,
          status: "posted",
          issueDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          paymentTerms: existing.paymentTerms,
          subtotal: existing.subtotal,
          taxAmount: existing.taxAmount,
          cgstAmount: cgst,
          sgstAmount: sgst,
          igstAmount: igst,
          totalAmount: existing.totalAmount,
          amountPaid: 0,
          amountDue: existing.totalAmount,
          ownerUserId: sec.userId,
          department: "Finance",
          createdById: sec.userId,
          notes: `Created from Quotation ${existing.quotationNumber}`,
          lines: {
            create: existing.lines.map((l) => ({
              productId: l.productId,
              description: l.description,
              quantity: l.quantity,
              unitPrice: l.unitPrice,
              discountPercent: l.discountPercent,
              taxRate: l.taxRate,
              taxAmount: l.taxAmount,
              lineTotal: l.lineTotal,
            })),
          },
        },
      });

      // Update Quotation Status
      await prisma.quotation.update({
        where: { id: existing.id },
        data: {
          status: "invoiced",
          convertedToInvoiceId: invoice.id,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          organizationId: existing.organizationId,
          recordType: "quotation",
          recordId: existing.id,
          action: "converted",
          fieldName: "invoice",
          newValue: invoice.invoiceNumber,
          userId: sec.userId,
        },
      });

      return NextResponse.json({ quotation: existing, invoice });
    }

    // Status change (draft -> sent -> approved -> confirmed -> cancelled)
    const updated = await prisma.quotation.update({
      where: { id },
      data: { status: status || existing.status },
      include: { customer: true, lines: true },
    });

    await prisma.auditLog.create({
      data: {
        organizationId: existing.organizationId,
        recordType: "quotation",
        recordId: existing.id,
        action: "status_change",
        fieldName: "status",
        oldValue: existing.status,
        newValue: status,
        userId: sec.userId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Sales PATCH error:", error);
    return NextResponse.json({ error: "Failed to update quotation" }, { status: 500 });
  }
}
