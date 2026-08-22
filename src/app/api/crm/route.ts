import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const branchId = searchParams.get("branchId");

    const org = orgId
      ? await prisma.organization.findUnique({ where: { id: orgId } })
      : await prisma.organization.findFirst();

    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const stages = await prisma.cRMStage.findMany({
      where: { organizationId: org.id },
      orderBy: { sequence: "asc" },
    });

    const whereClause: any = { organizationId: org.id };
    if (branchId) whereClause.branchId = branchId;

    const leads = await prisma.lead.findMany({
      where: whereClause,
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

    const org = orgId
      ? await prisma.organization.findUnique({ where: { id: orgId } })
      : await prisma.organization.findFirst();

    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    // Fallback to first stage if not provided
    let finalStageId = stageId;
    if (!finalStageId) {
      const firstStage = await prisma.cRMStage.findFirst({
        where: { organizationId: org.id },
        orderBy: { sequence: "asc" },
      });
      finalStageId = firstStage?.id;
    }

    const lead = await prisma.lead.create({
      data: {
        organizationId: org.id,
        branchId: branchId || null,
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
        assignedToId: assignedToId || null,
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
        organizationId: org.id,
        recordType: "lead",
        recordId: lead.id,
        action: "create",
        fieldName: "opportunity",
        newValue: lead.name,
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

    const existing = await prisma.lead.findUnique({
      where: { id },
      include: { stage: true },
    });

    if (!existing) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

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

    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
