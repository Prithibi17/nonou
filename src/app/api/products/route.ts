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

    const products = await prisma.product.findMany({
      where: { organizationId: org.id },
      include: { category: true, variants: true },
      orderBy: { createdAt: "desc" },
    });

    const categories = await prisma.productCategory.findMany({
      where: { organizationId: org.id },
    });

    return NextResponse.json({ products, categories });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      sku,
      barcode,
      categoryId,
      productType,
      sellingPrice,
      costPrice,
      taxRate,
      hsnCode,
      stockOnHand,
      reorderLevel,
      uom,
      description,
      orgId,
    } = body;

    const org = orgId
      ? await prisma.organization.findUnique({ where: { id: orgId } })
      : await prisma.organization.findFirst();

    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const product = await prisma.product.create({
      data: {
        organizationId: org.id,
        name,
        sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
        barcode: barcode || null,
        categoryId: categoryId || null,
        productType: productType || "storable",
        sellingPrice: Number(sellingPrice) || 0,
        costPrice: Number(costPrice) || 0,
        taxRate: Number(taxRate) || 18,
        hsnCode: hsnCode || null,
        stockOnHand: Number(stockOnHand) || 0,
        reorderLevel: Number(reorderLevel) || 5,
        uom: uom || "Units",
        description: description || null,
      },
      include: { category: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product POST error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
