import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    const org = orgId
      ? await prisma.organization.findUnique({ where: { id: orgId } })
      : await prisma.organization.findFirst();

    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const projects = await prisma.project.findMany({
      where: { organizationId: org.id },
      include: {
        customer: true,
        stages: {
          orderBy: { sequence: "asc" },
          include: {
            tasks: {
              include: {
                assignedTo: {
                  select: { id: true, firstName: true, lastName: true, avatarUrl: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const tasks = await prisma.task.findMany({
      where: { organizationId: org.id },
      include: {
        project: true,
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

    return NextResponse.json({ projects, tasks, users });
  } catch (error) {
    console.error("Projects GET error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type } = body;

    // Create New Task
    if (type === "task") {
      const { projectId, stageId, title, description, priority, dueDate, estimatedHours, assignedToId, orgId } = body;
      const org = orgId ? await prisma.organization.findUnique({ where: { id: orgId } }) : await prisma.organization.findFirst();

      const task = await prisma.task.create({
        data: {
          organizationId: org!.id,
          projectId,
          stageId,
          title,
          description,
          priority: priority || "Medium",
          dueDate: dueDate ? new Date(dueDate) : null,
          estimatedHours: Number(estimatedHours) || 0,
          assignedToId: assignedToId || null,
        },
        include: {
          project: true,
          stage: true,
          assignedTo: true,
        },
      });

      return NextResponse.json(task);
    }

    // Create New Project
    const { name, code, description, customerId, budget, orgId } = body;
    const org = orgId ? await prisma.organization.findUnique({ where: { id: orgId } }) : await prisma.organization.findFirst();

    const project = await prisma.project.create({
      data: {
        organizationId: org!.id,
        name,
        code: code || `PRJ-${Date.now().toString().slice(-4)}`,
        description,
        customerId: customerId || null,
        budget: Number(budget) || 0,
        stages: {
          create: [
            { name: "Backlog", sequence: 1, color: "#64748b" },
            { name: "In Progress", sequence: 2, color: "#3b82f6" },
            { name: "In Review", sequence: 3, color: "#f59e0b" },
            { name: "Done", sequence: 4, color: "#10b981" },
          ],
        },
      },
      include: {
        stages: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Projects POST error:", error);
    return NextResponse.json({ error: "Failed to create project/task" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { taskId, stageId, status, priority, title } = body;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        stageId: stageId !== undefined ? stageId : undefined,
        status: status !== undefined ? status : undefined,
        priority: priority !== undefined ? priority : undefined,
        title: title !== undefined ? title : undefined,
      },
      include: {
        stage: true,
        project: true,
        assignedTo: true,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
