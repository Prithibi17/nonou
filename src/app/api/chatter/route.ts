import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const recordType = searchParams.get("recordType");
    const recordId = searchParams.get("recordId");
    const orgId = searchParams.get("orgId");

    const org = orgId
      ? await prisma.organization.findUnique({ where: { id: orgId } })
      : await prisma.organization.findFirst();

    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const whereClause: any = { organizationId: org.id };
    if (recordType && recordId) {
      whereClause.recordType = recordType;
      whereClause.recordId = recordId;
    }

    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    const auditLogs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments, activities, auditLogs });
  } catch (error) {
    console.error("Chatter GET error:", error);
    return NextResponse.json({ error: "Failed to fetch chatter data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { actionType } = body;

    const org = await prisma.organization.findFirst();
    const user = await prisma.user.findFirst();

    // 1. Post a Comment
    if (actionType === "comment") {
      const { recordType, recordId, content } = body;
      const comment = await prisma.comment.create({
        data: {
          organizationId: org!.id,
          recordType,
          recordId,
          content,
          authorId: user!.id,
        },
        include: {
          author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      });
      return NextResponse.json(comment);
    }

    // 2. Schedule an Activity
    if (actionType === "schedule_activity") {
      const { recordType, recordId, activityType, summary, notes, dueDate, assignedToId } = body;
      const activity = await prisma.activity.create({
        data: {
          organizationId: org!.id,
          recordType,
          recordId,
          activityType: activityType || "todo",
          summary,
          notes,
          dueDate: new Date(dueDate),
          assignedToId: assignedToId || user!.id,
          createdById: user!.id,
        },
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        },
      });

      // Also record in audit log
      await prisma.auditLog.create({
        data: {
          organizationId: org!.id,
          recordType,
          recordId,
          action: "activity_scheduled",
          fieldName: "activity",
          newValue: `${activityType.toUpperCase()}: ${summary}`,
          userId: user!.id,
        },
      });

      return NextResponse.json(activity);
    }

    // 3. Mark Activity Done
    if (actionType === "mark_done") {
      const { activityId } = body;
      const updated = await prisma.activity.update({
        where: { id: activityId },
        data: {
          isDone: true,
          doneAt: new Date(),
        },
        include: {
          assignedTo: true,
        },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Chatter POST error:", error);
    return NextResponse.json({ error: "Failed to process chatter action" }, { status: 500 });
  }
}
