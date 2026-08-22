"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/core/shell/AppShell";
import { DataTable } from "@/components/core/data-table/DataTable";
import {
  Package,
  Plus,
  AlertTriangle,
  Tag,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils";
import { ProductItem } from "@/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categoryId: "",
    productType: "service",
    sellingPrice: 1000,
    costPrice: 500,
    taxRate: 18,
    hsnCode: "997331",
    stockOnHand: 50,
    reorderLevel: 5,
    uom: "Units",
    description: "",
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products || []);
      setCategories(data.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setModalOpen(false);
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const columns: ColumnDef<ProductItem>[] = [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
            <Package className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{row.original.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono">SKU: {row.original.sku}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {row.original.category?.name || "General"}
        </span>
      ),
    },
    {
      accessorKey: "sellingPrice",
      header: "Selling Price",
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          {formatCurrency(row.original.sellingPrice)}
        </span>
      ),
    },
    {
      accessorKey: "costPrice",
      header: "Cost Price",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatCurrency(row.original.costPrice)}
        </span>
      ),
    },
    {
      id: "margin",
      header: "Gross Margin",
      cell: ({ row }) => {
        const margin =
          row.original.sellingPrice > 0
            ? ((row.original.sellingPrice - row.original.costPrice) / row.original.sellingPrice) * 100
            : 0;
        return (
          <span className="font-semibold text-emerald-600">
            {margin.toFixed(1)}%
          </span>
        );
      },
    },
    {
      accessorKey: "stockOnHand",
      header: "Stock Level",
      cell: ({ row }) => {
        const stock = row.original.stockOnHand;
        const reorder = row.original.reorderLevel;
        const isLow = stock <= reorder;

        return (
          <div className="flex items-center gap-1.5">
            <span className={`font-bold ${isLow ? "text-red-600" : "text-foreground"}`}>
              {stock} {row.original.uom}
            </span>
            {isLow && (
              <span className="flex items-center gap-0.5 rounded bg-red-50 text-red-700 px-1 py-0.2 text-[9px] font-bold">
                <AlertTriangle className="h-3 w-3" /> Low
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "hsnCode",
      header: "HSN / SAC",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.hsnCode || "-"}</span>,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 border border-amber-200">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Product & Service Catalog</h1>
              <p className="text-xs text-muted-foreground">Unified product master shared across Sales, Invoicing & Inventory</p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          data={products}
          searchPlaceholder="Search catalog by product name, SKU or HSN..."
        />

        {/* Add Product Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600 text-white">
                    <Package className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">New Product Master Item</h3>
                </div>
                <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="p-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Product / Service Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dedicated High-Availability Cluster"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">SKU Code</label>
                    <input
                      type="text"
                      placeholder="e.g. BOS-HA-01"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">HSN / SAC Code</label>
                    <input
                      type="text"
                      placeholder="997331"
                      value={formData.hsnCode}
                      onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Cost Price (₹)</label>
                    <input
                      type="number"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Tax Rate (%)</label>
                    <select
                      value={formData.taxRate}
                      onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                    >
                      <option value={0}>0% (Exempt)</option>
                      <option value={5}>5% GST</option>
                      <option value={12}>12% GST</option>
                      <option value={18}>18% GST (Standard)</option>
                      <option value={28}>28% GST</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Initial Stock Level</label>
                    <input
                      type="number"
                      value={formData.stockOnHand}
                      onChange={(e) => setFormData({ ...formData, stockOnHand: Number(e.target.value) })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
                  >
                    Create Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
