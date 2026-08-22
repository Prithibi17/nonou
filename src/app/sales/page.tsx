"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/core/shell/AppShell";
import { DataTable } from "@/components/core/data-table/DataTable";
import {
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  Receipt,
  Building2,
  Calendar,
  X,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { QuotationItem } from "@/types";
import confetti from "canvas-confetti";

export default function SalesPage() {
  const [quotations, setQuotations] = useState<QuotationItem[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<QuotationItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Quotation Form State
  const [customerId, setCustomerId] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("30 Days");
  const [lines, setLines] = useState<any[]>([
    { productId: "", description: "Enterprise Software License", quantity: 1, unitPrice: 180000, discountPercent: 0, taxRate: 18 },
  ]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/sales");
      const data = await res.json();
      setQuotations(data.quotations || []);
      setCustomers(data.customers || []);
      setProducts(data.products || []);
      if (data.customers?.length > 0 && !customerId) {
        setCustomerId(data.customers[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addLine = () => {
    setLines([
      ...lines,
      { productId: "", description: "Consulting & Implementation", quantity: 1, unitPrice: 25000, discountPercent: 0, taxRate: 18 },
    ]);
  };

  const removeLine = (idx: number) => {
    const next = [...lines];
    next.splice(idx, 1);
    setLines(next);
  };

  const updateLine = (idx: number, updates: any) => {
    const next = [...lines];
    next[idx] = { ...next[idx], ...updates };
    setLines(next);
  };

  const handleProductSelect = (idx: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      updateLine(idx, {
        productId: prod.id,
        description: prod.name,
        unitPrice: prod.sellingPrice,
        taxRate: prod.taxRate,
      });
    }
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          paymentTerms,
          lines,
        }),
      });
      setCreateModalOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusUpdate = async (quoteId: string, status: string) => {
    try {
      await fetch("/api/sales", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: quoteId, status }),
      });
      fetchData();
      if (selectedQuote) {
        setSelectedQuote({ ...selectedQuote, status: status as any });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConvertToInvoice = async (quoteId: string) => {
    try {
      const res = await fetch("/api/sales", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: quoteId, action: "convert_to_invoice" }),
      });
      const data = await res.json();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      fetchData();
      setSelectedQuote(null);
    } catch (e) {
      console.error(e);
    }
  };

  // Calculations for new quote
  const calculateTotals = () => {
    let subtotal = 0;
    let tax = 0;
    lines.forEach((l) => {
      const base = (Number(l.quantity) || 1) * (Number(l.unitPrice) || 0) * (1 - (Number(l.discountPercent) || 0) / 100);
      const lineTax = (base * (Number(l.taxRate) || 18)) / 100;
      subtotal += base;
      tax += lineTax;
    });
    return { subtotal, tax, total: subtotal + tax };
  };

  const totals = calculateTotals();

  // Table Columns
  const columns: ColumnDef<QuotationItem>[] = [
    {
      accessorKey: "quotationNumber",
      header: "Quotation #",
      cell: ({ row }) => (
        <div className="font-bold text-foreground flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-blue-500" />
          <span>{row.original.quotationNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.original.customer?.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.customer?.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          {formatCurrency(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const color =
          status === "invoiced"
            ? "bg-emerald-100 text-emerald-800"
            : status === "confirmed"
            ? "bg-blue-100 text-blue-800"
            : status === "approved"
            ? "bg-purple-100 text-purple-800"
            : "bg-slate-100 text-slate-700";
        return (
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${color}`}>
            {status.toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: "issueDate",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.issueDate),
    },
    {
      accessorKey: "paymentTerms",
      header: "Terms",
      cell: ({ row }) => row.original.paymentTerms,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 border border-blue-200">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Sales & Quotations</h1>
              <p className="text-xs text-muted-foreground">
                {quotations.length} Quotations • Total:{" "}
                <strong className="text-foreground">
                  {formatCurrency(quotations.reduce((a, b) => a + (b.totalAmount || 0), 0))}
                </strong>
              </p>
            </div>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Quotation</span>
          </button>
        </div>

        {/* Quotations List Table */}
        <DataTable
          columns={columns}
          data={quotations}
          searchPlaceholder="Search quotations by number or customer..."
          onRowClick={(quote) => setSelectedQuote(quote)}
        />

        {/* Quotation Detail / Action Drawer */}
        {selectedQuote && (
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-border bg-card shadow-2xl animate-in slide-in-from-right">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{selectedQuote.quotationNumber}</h3>
                  <span className="text-[11px] text-muted-foreground">{selectedQuote.customer?.name}</span>
                </div>
              </div>
              <button onClick={() => setSelectedQuote(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Status Pipeline & Action Bar */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-3">
              <div className="flex items-center gap-1 text-[11px]">
                {["draft", "sent", "approved", "confirmed", "invoiced"].map((st) => (
                  <span
                    key={st}
                    className={`rounded-md px-2 py-0.5 font-bold uppercase ${
                      selectedQuote.status === st
                        ? "bg-brand-600 text-white shadow-xs"
                        : "text-muted-foreground"
                    }`}
                  >
                    {st}
                  </span>
                ))}
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-2">
                {selectedQuote.status === "draft" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedQuote.id, "sent")}
                    className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    Send to Customer
                  </button>
                )}
                {selectedQuote.status === "sent" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedQuote.id, "approved")}
                    className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    Mark Approved
                  </button>
                )}
                {selectedQuote.status === "approved" && (
                  <button
                    onClick={() => handleStatusUpdate(selectedQuote.id, "confirmed")}
                    className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white hover:bg-brand-700"
                  >
                    Confirm Order
                  </button>
                )}
                {selectedQuote.status === "confirmed" && (
                  <button
                    onClick={() => handleConvertToInvoice(selectedQuote.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500"
                  >
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Convert to Invoice</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quotation Body / Preview */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer & Info Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-muted/20 p-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Bill To:</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedQuote.customer?.name}</p>
                  <p className="text-muted-foreground">{selectedQuote.customer?.companyName}</p>
                  <p className="text-muted-foreground font-mono">GSTIN: {selectedQuote.customer?.gstin || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Quotation Meta:</span>
                  <p className="text-muted-foreground mt-0.5">Date: <strong className="text-foreground">{formatDate(selectedQuote.issueDate)}</strong></p>
                  <p className="text-muted-foreground">Terms: <strong className="text-foreground">{selectedQuote.paymentTerms}</strong></p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Item Description</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Tax (18%)</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedQuote.lines?.map((line) => (
                      <tr key={line.id}>
                        <td className="px-3 py-2 font-medium text-foreground">{line.description}</td>
                        <td className="px-3 py-2 text-right">{line.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(line.unitPrice)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(line.taxAmount)}</td>
                        <td className="px-3 py-2 text-right font-bold text-foreground">{formatCurrency(line.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 rounded-xl border border-border bg-muted/20 p-3 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(selectedQuote.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST Tax (18%):</span>
                    <span>{formatCurrency(selectedQuote.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1.5 font-bold text-foreground text-sm">
                    <span>Grand Total:</span>
                    <span className="text-brand-600">{formatCurrency(selectedQuote.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Quotation Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">New Quotation Builder</h3>
                </div>
                <button onClick={() => setCreateModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateQuotation} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Customer / Client *</label>
                    <select
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      required
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.companyName ? `(${c.companyName})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Payment Terms</label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                    >
                      <option value="Immediate">Immediate / Advance</option>
                      <option value="15 Days">15 Days Net</option>
                      <option value="30 Days">30 Days Net</option>
                      <option value="60 Days">60 Days Net</option>
                    </select>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-foreground">Quotation Items & Services</label>
                  {lines.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 p-2.5">
                      <select
                        value={line.productId}
                        onChange={(e) => handleProductSelect(idx, e.target.value)}
                        className="w-48 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                      >
                        <option value="">Choose Catalog Product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Description"
                        value={line.description}
                        onChange={(e) => updateLine(idx, { description: e.target.value })}
                        className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        value={line.quantity}
                        onChange={(e) => updateLine(idx, { quantity: e.target.value })}
                        className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                      />
                      <input
                        type="number"
                        placeholder="Unit Price"
                        value={line.unitPrice}
                        onChange={(e) => updateLine(idx, { unitPrice: e.target.value })}
                        className="w-24 rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground"
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Item Line</span>
                  </button>
                </div>

                {/* Live Totals Card */}
                <div className="flex justify-end">
                  <div className="w-60 rounded-xl border border-border bg-muted/30 p-3 text-xs space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>GST (18%):</span>
                      <span>{formatCurrency(totals.tax)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1 font-bold text-foreground">
                      <span>Grand Total:</span>
                      <span className="text-brand-600">{formatCurrency(totals.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm"
                  >
                    Create Quotation
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
