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
    if (!sec) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!evaluatePermission(sec, "crm", "view")) {
      return NextResponse.json({ error: "Access Denied: You do not have permission to view CRM." }, { status: 403 });
    }

    const stages = await prisma.cRMStage.findMany({
      where: { organizationId: sec.organizationId },
      orderBy: { sequence: "asc" },
    });

    // Apply 5-dimensional record-level scoping filter (own, team, branch, org)
    const scopeFilter = buildPrismaRecordFilter(sec, "crm");
    if (branchId) {
      scopeFilter.branchId = branchId;
    }

    const leads = await prisma.lead.findMany({
      where: scopeFilter,
      include: {
        stage: true,
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    return NextResponse.json({ stages, leads, users });
  } catch (error) {
    console.error("CRM GET error:", error);
    return NextResponse.json({ error: "Failed to fetch CRM data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      companyName,
      contactName,
      email,
      phone,
      source,
      priority,
      expectedRevenue,
      probability,
      stageId,
      assignedToId,
      tags,
      notes,
      expectedClosing,
      orgId,
      branchId,
    } = body;

    const sec = await getSecurityContext(orgId);
    if (!sec) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!evaluatePermission(sec, "crm", "create")) {
      return NextResponse.json({ error: "Access Denied: You do not have permission to create opportunities." }, { status: 403 });
    }

    // Fallback to first stage if not provided
    let finalStageId = stageId;
    if (!finalStageId) {
      const firstStage = await prisma.cRMStage.findFirst({
        where: { organizationId: sec.organizationId },
        orderBy: { sequence: "asc" },
      });
      finalStageId = firstStage?.id;
    }

    const lead = await prisma.lead.create({
      data: {
        organizationId: sec.organizationId,
        branchId: branchId || sec.branchId || null,
        name,
        companyName: companyName || null,
        contactName: contactName || null,
        email: email || null,
        phone: phone || null,
        source: source || "Website",
        priority: priority || "Medium",
        expectedRevenue: Number(expectedRevenue) || 0,
        probability: Number(probability) || 10,
        stageId: finalStageId,
        assignedToId: assignedToId || sec.userId,
        ownerUserId: sec.userId,
        department: sec.department || null,
        team: sec.team || null,
        tags: tags || null,
        notes: notes || null,
        expectedClosing: expectedClosing ? new Date(expectedClosing) : null,
      },
      include: {
        stage: true,
        assignedTo: true,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        organizationId: sec.organizationId,
        recordType: "lead",
        recordId: lead.id,
        action: "create",
        fieldName: "opportunity",
        newValue: lead.name,
        userId: sec.userId,
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error("CRM POST error:", error);
    return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, stageId, priority, expectedRevenue, probability, assignedToId, notes, lostReason } = body;

    if (!id) return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });

    const sec = await getSecurityContext();
    if (!sec) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.lead.findUnique({
      where: { id },
      include: { stage: true },
    });

    if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    if (!evaluatePermission(sec, "crm", "edit", existing)) {
      return NextResponse.json({ error: "Access Denied: You cannot modify this opportunity." }, { status: 403 });
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        stageId: stageId !== undefined ? stageId : existing.stageId,
        priority: priority !== undefined ? priority : existing.priority,
        expectedRevenue: expectedRevenue !== undefined ? Number(expectedRevenue) : existing.expectedRevenue,
        probability: probability !== undefined ? Number(probability) : existing.probability,
        assignedToId: assignedToId !== undefined ? assignedToId : existing.assignedToId,
        notes: notes !== undefined ? notes : existing.notes,
        lostReason: lostReason !== undefined ? lostReason : existing.lostReason,
      },
      include: {
        stage: true,
        assignedTo: true,
      },
    });

    // Audit log if stage changed
    if (stageId && stageId !== existing.stageId) {
      const newStage = await prisma.cRMStage.findUnique({ where: { id: stageId } });
      await prisma.auditLog.create({
        data: {
          organizationId: existing.organizationId,
          recordType: "lead",
          recordId: existing.id,
          action: "stage_change",
          fieldName: "stage",
          oldValue: existing.stage.name,
          newValue: newStage?.name || stageId,
          userId: sec.userId,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("CRM PATCH error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Lead ID required" }, { status: 400 });

    const sec = await getSecurityContext();
    if (!sec) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    if (!evaluatePermission(sec, "crm", "delete", existing)) {
      return NextResponse.json({ error: "Access Denied: You do not have permission to delete this opportunity." }, { status: 403 });
    }

    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
