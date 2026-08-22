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

    const branches = await prisma.branch.findMany({
      where: { organizationId: org.id },
    });

    const roles = await prisma.role.findMany({
      where: { organizationId: org.id },
      include: { permissions: true, _count: { select: { organizationUsers: true } } },
    });

    const customFields = await prisma.customField.findMany({
      where: { organizationId: org.id },
      orderBy: { position: "asc" },
    });

    const automations = await prisma.automationRule.findMany({
      where: { organizationId: org.id },
      orderBy: { createdAt: "desc" },
    });

    const apps = await prisma.organizationApp.findMany({
      where: { organizationId: org.id },
    });

    const auditLogs = await prisma.auditLog.findMany({
      where: { organizationId: org.id },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      organization: org,
      branches,
      roles,
      customFields,
      automations,
      apps,
      auditLogs,
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type } = body;

    const org = await prisma.organization.findFirst();

    // 1. Create Custom Field
    if (type === "custom_field") {
      const { modelName, name, label, fieldType, isRequired, options } = body;
      const field = await prisma.customField.create({
        data: {
          organizationId: org!.id,
          modelName,
          name: name.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
          label,
          fieldType: fieldType || "text",
          isRequired: Boolean(isRequired),
          optionsJson: options ? JSON.stringify(options) : null,
        },
      });
      return NextResponse.json(field);
    }

    // 2. Create Branch
    if (type === "branch") {
      const { name, code, address, phone, email } = body;
      const branch = await prisma.branch.create({
        data: {
          organizationId: org!.id,
          name,
          code: code.toUpperCase(),
          address,
          phone,
          email,
        },
      });
      return NextResponse.json(branch);
    }

    // 3. Create Automation Rule
    if (type === "automation") {
      const { name, modelName, triggerType, conditions, actions } = body;
      const rule = await prisma.automationRule.create({
        data: {
          organizationId: org!.id,
          name,
          modelName,
          triggerType,
          conditionsJson: JSON.stringify(conditions || { operator: "AND", conditions: [] }),
          actionsJson: JSON.stringify(actions || []),
          isActive: true,
        },
      });
      return NextResponse.json(rule);
    }

    // 4. Toggle App Installation
    if (type === "toggle_app") {
      const { appKey, isInstalled } = body;
      const app = await prisma.organizationApp.upsert({
        where: {
          organizationId_appKey: {
            organizationId: org!.id,
            appKey,
          },
        },
        update: { isInstalled },
        create: {
          organizationId: org!.id,
          appKey,
          isInstalled,
        },
      });
      return NextResponse.json(app);
    }

    // 5. Purge Demo Data / Reset to Clean Real Workspace
    if (type === "purge_demo_data") {
      await prisma.payment.deleteMany({});
      await prisma.invoiceLine.deleteMany({});
      await prisma.invoice.deleteMany({});
      await prisma.quotationLine.deleteMany({});
      await prisma.quotation.deleteMany({});
      await prisma.lead.deleteMany({});
      await prisma.task.deleteMany({});
      await prisma.timesheet.deleteMany({});
      await prisma.project.deleteMany({});
      await prisma.productVariant.deleteMany({});
      await prisma.product.deleteMany({});
      await prisma.contact.deleteMany({});
      await prisma.activity.deleteMany({});
      await prisma.comment.deleteMany({});
      await prisma.auditLog.deleteMany({});

      return NextResponse.json({ success: true, message: "Demo data purged. Workspace is clean and ready for real records." });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
