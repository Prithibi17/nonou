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

    if (!evaluatePermission(sec, "invoices", "view")) {
      return NextResponse.json({ error: "Access Denied: You do not have permission to view invoices." }, { status: 403 });
    }

    const scopeFilter = buildPrismaRecordFilter(sec, "invoices");
    if (branchId) scopeFilter.branchId = branchId;

    const invoices = await prisma.invoice.findMany({
      where: scopeFilter,
      include: {
        customer: true,
        lines: { include: { product: true } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const customers = await prisma.contact.findMany({
      where: { organizationId: sec.organizationId, isCustomer: true },
      select: { id: true, name: true, companyName: true, email: true, phone: true, gstin: true, state: true },
    });

    const products = await prisma.product.findMany({
      where: { organizationId: sec.organizationId, isActive: true },
      select: { id: true, name: true, sku: true, sellingPrice: true, taxRate: true, hsnCode: true },
    });

    return NextResponse.json({ invoices, customers, products });
  } catch (error) {
    console.error("Invoices GET error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerId,
      issueDate,
      dueDate,
      paymentTerms,
      notes,
      terms,
      lines,
      orgId,
      branchId,
    } = body;

    const sec = await getSecurityContext(orgId);
    if (!sec) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!evaluatePermission(sec, "invoices", "create")) {
      return NextResponse.json({ error: "Access Denied: You do not have permission to create invoices." }, { status: 403 });
    }

    const customer = await prisma.contact.findUnique({ where: { id: customerId } });

    // Generate Invoice Number
    const count = await prisma.invoice.count({ where: { organizationId: sec.organizationId } });
    const currentYear = new Date().getFullYear();
    const invoiceNumber = `INV-${currentYear}-${String(count + 1).padStart(4, "0")}`;

    // Calculate Subtotal & Tax
    let subtotal = 0;
    let taxAmount = 0;

    const processedLines = (lines || []).map((line: any) => {
      const qty = Number(line.quantity) || 1;
      const price = Number(line.unitPrice) || 0;
      const discount = Number(line.discountPercent) || 0;
      const taxRate = Number(line.taxRate) || 18;

      const base = qty * price * (1 - discount / 100);
      const tax = (base * taxRate) / 100;
      const lineTotal = base + tax;

      subtotal += base;
      taxAmount += tax;

      return {
        productId: line.productId || null,
        description: line.description || "Service / Item",
        hsnCode: line.hsnCode || "997331",
        quantity: qty,
        unitPrice: price,
        discountPercent: discount,
        taxRate: taxRate,
        taxAmount: tax,
        lineTotal: lineTotal,
      };
    });

    const totalAmount = subtotal + taxAmount;

    // Split CGST / SGST if intra-state or IGST if inter-state
    const isLocal = customer?.state?.toLowerCase().includes("karnataka") ?? true;
    const cgstAmount = isLocal ? taxAmount / 2 : 0;
    const sgstAmount = isLocal ? taxAmount / 2 : 0;
    const igstAmount = !isLocal ? taxAmount : 0;

    const invoice = await prisma.invoice.create({
      data: {
        organizationId: sec.organizationId,
        branchId: branchId || sec.branchId || null,
        invoiceNumber,
        customerId,
        status: "posted",
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paymentTerms: paymentTerms || "30 Days",
        subtotal,
        taxAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalAmount,
        amountPaid: 0,
        amountDue: totalAmount,
        ownerUserId: sec.userId,
        department: "Finance",
        createdById: sec.userId,
        notes,
        terms,
        lines: { create: processedLines },
      },
      include: {
        customer: true,
        lines: { include: { product: true } },
        payments: true,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        organizationId: sec.organizationId,
        recordType: "invoice",
        recordId: invoice.id,
        action: "create",
        fieldName: "invoiceNumber",
        newValue: invoice.invoiceNumber,
        userId: sec.userId,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Invoices POST error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, action, amount, paymentMethod, referenceNumber, notes, status } = body;

    const sec = await getSecurityContext();
    if (!sec) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, payments: true },
    });

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    // Handle Record Payment Action
    if (action === "record_payment") {
      if (!evaluatePermission(sec, "invoices", "edit", invoice)) {
        return NextResponse.json({ error: "Access Denied: You cannot record payments on this invoice." }, { status: 403 });
      }

      const payAmount = Number(amount) || 0;
      if (payAmount <= 0) return NextResponse.json({ error: "Payment amount must be greater than 0" }, { status: 400 });

      // Check approval limits (e.g. Accountant payment <= ₹50,000)
      const perm = sec.permissions.find((p) => p.module === "invoices");
      if (perm?.maxApprovalAmount && payAmount > perm.maxApprovalAmount) {
        return NextResponse.json(
          { error: `Payment approval limit exceeded. Your maximum direct payment limit is ₹${perm.maxApprovalAmount.toLocaleString()}. Manager approval required.` },
          { status: 403 }
        );
      }

      const payCount = await prisma.payment.count({ where: { organizationId: invoice.organizationId } });
      const paymentNumber = `PAY-${new Date().getFullYear()}-${String(payCount + 1).padStart(4, "0")}`;

      const payment = await prisma.payment.create({
        data: {
          organizationId: invoice.organizationId,
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          paymentNumber,
          amount: payAmount,
          paymentMethod: paymentMethod || "Bank Transfer",
          referenceNumber: referenceNumber || null,
          paymentDate: new Date(),
          notes: notes || null,
          createdById: sec.userId,
        },
      });

      const newAmountPaid = invoice.amountPaid + payAmount;
      const newAmountDue = Math.max(0, invoice.totalAmount - newAmountPaid);
      const newStatus = newAmountDue === 0 ? "paid" : "partial";

      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          status: newStatus,
        },
        include: { customer: true, lines: true, payments: true },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          organizationId: invoice.organizationId,
          recordType: "invoice",
          recordId: invoice.id,
          action: "payment_received",
          fieldName: "amountPaid",
          oldValue: `₹${invoice.amountPaid}`,
          newValue: `₹${newAmountPaid}`,
          userId: sec.userId,
        },
      });

      return NextResponse.json({ invoice: updatedInvoice, payment });
    }

    // Direct status update (reversal / cancellation)
    if (!evaluatePermission(sec, "invoices", "edit", invoice)) {
      return NextResponse.json({ error: "Access Denied: You cannot edit this invoice." }, { status: 403 });
    }

    const updated = await prisma.invoice.update({
      where: { id },
      data: { status: status || invoice.status },
      include: { customer: true, lines: true, payments: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Invoice PATCH error:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Invoice ID required" }, { status: 400 });

    const sec = await getSecurityContext();
    if (!sec) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    // Financial Record Immutability Enforcement: Posted/Paid invoices cannot be directly deleted
    if (invoice.status === "posted" || invoice.status === "paid") {
      return NextResponse.json(
        {
          error: "Accounting Integrity Violation: Posted financial invoices cannot be deleted. You must reverse or cancel them via a Credit Note to maintain the audit trail.",
        },
        { status: 400 }
      );
    }

    if (!evaluatePermission(sec, "invoices", "delete", invoice)) {
      return NextResponse.json({ error: "Access Denied: You do not have permission to delete this invoice." }, { status: 403 });
    }

    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
