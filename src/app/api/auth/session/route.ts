import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { seedStandardRolesForOrg } from "@/core/security/permission-engine";

export async function GET() {
  try {
    // 1. Get current authenticated user
    let user = await getCurrentUser();

    // Fallback: If no cookie yet, check if there is a single user in the DB
    if (!user) {
      user = await prisma.user.findFirst({
        orderBy: { createdAt: "desc" },
      });
    }

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // 2. Find OrganizationUser linkage
    const orgUser = await prisma.organizationUser.findFirst({
      where: { userId: user.id },
      include: {
        organization: {
          include: {
            branches: true,
            installedApps: true,
          },
        },
        role: {
          include: {
            permissions: true,
          },
        },
      },
    });

    if (!orgUser) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
          isSuperAdmin: user.isSuperAdmin,
        },
        hasOrganization: false,
        activeOrg: null,
        branches: [],
      });
    }

    // Ensure all 15 standard enterprise roles exist for this organization
    const rolesCount = await prisma.role.count({
      where: { organizationId: orgUser.organization.id },
    });
    if (rolesCount < 10) {
      await seedStandardRolesForOrg(prisma, orgUser.organization.id);
    }

    const allOrgs = await prisma.organization.findMany({
      where: {
        organizationUsers: {
          some: { userId: user.id },
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        industry: true,
        country: true,
        currencySymbol: true,
        logo: true,
      },
    });

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        isSuperAdmin: user.isSuperAdmin,
      },
      hasOrganization: true,
      activeOrg: orgUser.organization,
      activeBranchId: orgUser.defaultBranchId,
      department: (orgUser as any).department || "Management",
      team: (orgUser as any).team || "Core",
      portalType: (orgUser as any).portalType || null,
      portalContactId: (orgUser as any).portalContactId || null,
      branches: orgUser.organization.branches,
      role: orgUser.role,
      permissions: orgUser.role?.permissions || [],
      availableOrganizations: allOrgs.length > 0 ? allOrgs : [orgUser.organization],
    });
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
