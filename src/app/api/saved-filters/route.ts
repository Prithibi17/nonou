import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const modelName = searchParams.get("modelName");
    const org = await prisma.organization.findFirst();

    if (!org) return NextResponse.json([]);

    const filters = await prisma.savedFilter.findMany({
      where: {
        organizationId: org.id,
        ...(modelName ? { modelName } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(filters);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch saved filters" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, modelName, filterJson, isDefault, isShared, isPinned } = body;

    const org = await prisma.organization.findFirst();
    const user = await prisma.user.findFirst();

    const filter = await prisma.savedFilter.create({
      data: {
        organizationId: org!.id,
        userId: user!.id,
        modelName,
        name,
        filterJson: typeof filterJson === "string" ? filterJson : JSON.stringify(filterJson),
        isDefault: Boolean(isDefault),
        isShared: Boolean(isShared),
        isPinned: Boolean(isPinned),
      },
    });

    return NextResponse.json(filter);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save filter" }, { status: 500 });
  }
}
