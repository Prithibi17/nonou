import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";
import { seedStandardRolesForOrg, STANDARD_ENTERPRISE_ROLES } from "@/core/security/permission-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");

    const org = orgId
      ? await prisma.organization.findUnique({ where: { id: orgId } })
      : await prisma.organization.findFirst();

    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    // Auto-seed 15 standard enterprise roles if missing
    const existingRolesCount = await prisma.role.count({
      where: { organizationId: org.id },
    });
    if (existingRolesCount < 10) {
      await seedStandardRolesForOrg(prisma, org.id);
    }

    const branches = await prisma.branch.findMany({
      where: { organizationId: org.id },
    });

    const roles = await prisma.role.findMany({
      where: { organizationId: org.id },
      include: {
        permissions: true,
        _count: { select: { organizationUsers: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    const users = await prisma.organizationUser.findMany({
      where: { organizationId: org.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            isSuperAdmin: true,
          },
        },
        role: true,
      },
      orderBy: { joinedAt: "asc" },
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
      take: 30,
    });

    return NextResponse.json({
      organization: org,
      branches,
      roles,
      users,
      customFields,
      automations,
      apps,
      auditLogs,
      standardRolePresets: STANDARD_ENTERPRISE_ROLES,
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

    const currentUser = await getCurrentUser();
    const org = await prisma.organization.findFirst();

    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    // 1. Invite User & Assign Role with Department/Team
    if (type === "invite_user") {
      const { email, firstName, lastName, roleId, department, team, defaultBranchId } = body;

      if (!email || !roleId) {
        return NextResponse.json({ error: "Email and Role are required" }, { status: 400 });
      }

      // Check role constraints: Single Administrator rule
      const targetRole = await prisma.role.findUnique({ where: { id: roleId } });
      if (targetRole && (targetRole.name.includes("Administrator") || targetRole.name.includes("Owner"))) {
        const existingAdmin = await prisma.organizationUser.findFirst({
          where: {
            organizationId: org.id,
            roleId: targetRole.id,
          },
        });
        if (existingAdmin) {
          return NextResponse.json(
            { error: "Single Owner Invariant: Only one Administrator/Owner is permitted per organization." },
            { status: 403 }
          );
        }
      }

      // Find or create User
      let user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user) {
        const defaultHash = await hashPassword("Welcome@2026");
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase().trim(),
            firstName: firstName || "Team",
            lastName: lastName || "Member",
            passwordHash: defaultHash,
            isSuperAdmin: false,
          },
        });
      }

      // Create OrganizationUser link
      const orgUser = await prisma.organizationUser.upsert({
        where: {
          organizationId_userId: {
            organizationId: org.id,
            userId: user.id,
          },
        },
        update: {
          roleId,
          department: department || null,
          team: team || null,
          defaultBranchId: defaultBranchId || null,
          status: "active",
        },
        create: {
          organizationId: org.id,
          userId: user.id,
          roleId,
          department: department || null,
          team: team || null,
          defaultBranchId: defaultBranchId || null,
          status: "active",
          joinedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, orgUser });
    }

    // 2. Update Existing User Role & Scoping
    if (type === "update_user_role") {
      const { organizationUserId, roleId, department, team, defaultBranchId } = body;

      const targetRole = await prisma.role.findUnique({ where: { id: roleId } });
      if (targetRole && (targetRole.name.includes("Administrator") || targetRole.name.includes("Owner"))) {
        const otherAdmin = await prisma.organizationUser.findFirst({
          where: {
            organizationId: org.id,
            roleId: targetRole.id,
            id: { not: organizationUserId },
          },
        });
        if (otherAdmin) {
          return NextResponse.json(
            { error: "Single Owner Invariant: Cannot promote multiple users to Administrator/Owner." },
            { status: 403 }
          );
        }
      }

      const updated = await prisma.organizationUser.update({
        where: { id: organizationUserId },
        data: {
          roleId,
          department,
          team,
          defaultBranchId,
        },
      });

      return NextResponse.json(updated);
    }

    // 3. Update Role Permissions & Record Scopes
    if (type === "update_permission_scope") {
      const { permissionId, roleId, module, canView, canCreate, canEdit, canDelete, canApprove, canAssign, canExport, canImport, recordScope, maxApprovalAmount, fieldRestrictions } = body;

      const updated = await prisma.permission.upsert({
        where: {
          roleId_module: {
            roleId,
            module,
          },
        },
        update: {
          canView: canView ?? true,
          canCreate: canCreate ?? false,
          canEdit: canEdit ?? false,
          canDelete: canDelete ?? false,
          canApprove: canApprove ?? false,
          canAssign: canAssign ?? false,
          canExport: canExport ?? false,
          canImport: canImport ?? false,
          recordScope: recordScope || "own",
          maxApprovalAmount: maxApprovalAmount || null,
          fieldRestrictionsJson: fieldRestrictions ? JSON.stringify(fieldRestrictions) : null,
        },
        create: {
          roleId,
          module,
          canView: canView ?? true,
          canCreate: canCreate ?? false,
          canEdit: canEdit ?? false,
          canDelete: canDelete ?? false,
          canApprove: canApprove ?? false,
          canAssign: canAssign ?? false,
          canExport: canExport ?? false,
          canImport: canImport ?? false,
          recordScope: recordScope || "own",
          maxApprovalAmount: maxApprovalAmount || null,
          fieldRestrictionsJson: fieldRestrictions ? JSON.stringify(fieldRestrictions) : null,
        },
      });

      return NextResponse.json(updated);
    }

    // 4. Create Custom Field
    if (type === "custom_field") {
      const { modelName, name, label, fieldType, isRequired, options } = body;
      const field = await prisma.customField.create({
        data: {
          organizationId: org.id,
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

    // 5. Create Branch
    if (type === "branch") {
      const { name, code, address, phone, email } = body;
      const branch = await prisma.branch.create({
        data: {
          organizationId: org.id,
          name,
          code: code.toUpperCase(),
          address,
          phone,
          email,
        },
      });
      return NextResponse.json(branch);
    }

    // 6. Create Automation Rule
    if (type === "automation") {
      const { name, modelName, triggerType, conditions, actions } = body;
      const rule = await prisma.automationRule.create({
        data: {
          organizationId: org.id,
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

    // 7. Toggle App Installation
    if (type === "toggle_app") {
      const { appKey, isInstalled } = body;
      const app = await prisma.organizationApp.upsert({
        where: {
          organizationId_appKey: {
            organizationId: org.id,
            appKey,
          },
        },
        update: { isInstalled },
        create: {
          organizationId: org.id,
          appKey,
          isInstalled,
        },
      });
      return NextResponse.json(app);
    }

    // 8. Purge Demo Data / Reset to Clean Real Workspace
    if (type === "purge_demo_data") {
      await prisma.payment.deleteMany({});
      await prisma.invoiceLine.deleteMany({});
      await prisma.invoice.deleteMany({});
      await prisma.quotationLine.deleteMany({});
      await prisma.quotation.deleteMany({});
      await prisma.lead.deleteMany({});
      await prisma.task.deleteMany({});
      await prisma.timesheet.deleteMany({});
      await prisma.projectStage.deleteMany({});
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
