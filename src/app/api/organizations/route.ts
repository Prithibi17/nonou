import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const orgs = await prisma.organization.findMany({
      include: {
        branches: true,
        installedApps: true,
      },
    });
    return NextResponse.json(orgs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, industry, country, currency, gstin, phone, address, selectedApps } = body;

    let user = await getCurrentUser();
    if (!user) {
      user = await prisma.user.findFirst({ orderBy: { createdAt: "desc" } });
    }

    const slug = (name || "company")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-");

    const org = await prisma.organization.create({
      data: {
        name: name || "My Organization",
        slug: `${slug}-${Math.floor(Math.random() * 1000)}`,
        industry: industry || "General",
        country: country || "India",
        currency: currency || "INR",
        currencySymbol: currency === "USD" ? "$" : "₹",
        gstin,
        phone,
        address,
      },
    });

    // 1. Create Main Branch
    const branch = await prisma.branch.create({
      data: {
        organizationId: org.id,
        name: "Main Branch",
        code: "HQ-01",
        isMain: true,
        address,
        phone,
      },
    });

    // 2. Create Administrator Role & Permissions
    const adminRole = await prisma.role.create({
      data: {
        organizationId: org.id,
        name: "Administrator",
        description: "Full administrative access across all modules",
        isSystem: true,
      },
    });

    const modules = ["crm", "sales", "invoices", "products", "projects", "contacts", "settings", "automation"];
    for (const mod of modules) {
      await prisma.permission.create({
        data: {
          roleId: adminRole.id,
          module: mod,
          canView: true,
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canExport: true,
          canImport: true,
          canApprove: true,
          canConfigure: true,
        },
      });
    }

    // 3. Link User to Organization as Administrator
    if (user) {
      await prisma.organizationUser.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          roleId: adminRole.id,
          defaultBranchId: branch.id,
          status: "active",
          joinedAt: new Date(),
        },
      });
    }

    // 4. Install Selected Apps
    const appsToInstall = selectedApps && Array.isArray(selectedApps)
      ? selectedApps
      : ["crm", "sales", "invoices", "products", "projects", "contacts", "automations"];

    for (const appKey of appsToInstall) {
      await prisma.organizationApp.create({
        data: {
          organizationId: org.id,
          appKey,
          isInstalled: true,
        },
      });
    }

    // 5. Create Default Pipeline Stages
    const stages = [
      { name: "New", sequence: 1, probability: 10, color: "#6366f1" },
      { name: "Qualified", sequence: 2, probability: 30, color: "#3b82f6" },
      { name: "Proposal Sent", sequence: 3, probability: 60, color: "#f59e0b" },
      { name: "Negotiation", sequence: 4, probability: 80, color: "#8b5cf6" },
      { name: "Won", sequence: 5, probability: 100, isWon: true, color: "#10b981" },
      { name: "Lost", sequence: 6, probability: 0, isLost: true, color: "#ef4444" },
    ];

    for (const stage of stages) {
      await prisma.cRMStage.create({
        data: {
          organizationId: org.id,
          ...stage,
        },
      });
    }

    return NextResponse.json({ success: true, organization: org, branch });
  } catch (error) {
    console.error("Create org error:", error);
    return NextResponse.json({ error: "Failed to create organization" }, { status: 500 });
  }
}
