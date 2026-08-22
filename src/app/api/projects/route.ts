import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSecurityContext } from "@/lib/auth";
import { buildPrismaRecordFilter, evaluatePermission } from "@/core/security/permission-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    const sec = await getSecurityContext(orgId);
    if (!sec) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!evaluatePermission(sec, "projects", "view")) {
      return NextResponse.json({ error: "Access Denied: You cannot view projects." }, { status: 403 });
    }

    const scopeFilter = buildPrismaRecordFilter(sec, "projects");

    const projects = await prisma.project.findMany({
      where: scopeFilter,
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
      where: { organizationId: sec.organizationId },
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

    const sec = await getSecurityContext(body.orgId);
    if (!sec) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Create New Task
    if (type === "task") {
      const { projectId, stageId, title, description, priority, dueDate, estimatedHours, assignedToId } = body;

      if (!evaluatePermission(sec, "projects", "create")) {
        return NextResponse.json({ error: "Access Denied: You cannot create tasks." }, { status: 403 });
      }

      const task = await prisma.task.create({
        data: {
          organizationId: sec.organizationId,
          projectId,
          stageId,
          title,
          description,
          priority: priority || "Medium",
          dueDate: dueDate ? new Date(dueDate) : null,
          estimatedHours: Number(estimatedHours) || 0,
          assignedToId: assignedToId || sec.userId,
          createdById: sec.userId,
          department: sec.department || null,
          team: sec.team || null,
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
    if (!evaluatePermission(sec, "projects", "create")) {
      return NextResponse.json({ error: "Access Denied: You cannot create projects." }, { status: 403 });
    }

    const { name, code, description, customerId, budget } = body;

    const project = await prisma.project.create({
      data: {
        organizationId: sec.organizationId,
        branchId: sec.branchId || null,
        name,
        code: code || `PRJ-${Date.now().toString().slice(-4)}`,
        description,
        customerId: customerId || null,
        budget: Number(budget) || 0,
        managerId: sec.userId,
        department: sec.department || null,
        team: sec.team || null,
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

    const sec = await getSecurityContext();
    if (!sec) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    if (!evaluatePermission(sec, "projects", "edit", existing)) {
      return NextResponse.json({ error: "Access Denied: You cannot edit this task." }, { status: 403 });
    }

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
