"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/core/shell/AppShell";
import { DataTable } from "@/components/core/data-table/DataTable";
import {
  Receipt,
  Plus,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  X,
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InvoiceItem } from "@/types";
import confetti from "canvas-confetti";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [paymentReference, setPaymentReference] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Invoice Form
  const [newCustomerId, setNewCustomerId] = useState("");
  const [newLines, setNewLines] = useState<any[]>([
    { description: "Enterprise Cloud Hosting & Database Cluster", quantity: 1, unitPrice: 65000, taxRate: 18 },
  ]);

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(data.invoices || []);
      setCustomers(data.customers || []);
      setProducts(data.products || []);
      if (data.customers?.length > 0 && !newCustomerId) {
        setNewCustomerId(data.customers[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    try {
      const res = await fetch("/api/invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedInvoice.id,
          action: "record_payment",
          amount: paymentAmount,
          paymentMethod,
          referenceNumber: paymentReference,
        }),
      });
      const data = await res.json();
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
      });
      setPaymentModalOpen(false);
      fetchInvoices();
      if (data.invoice) {
        setSelectedInvoice(data.invoice);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: newCustomerId,
          lines: newLines,
        }),
      });
      setCreateModalOpen(false);
      fetchInvoices();
    } catch (e) {
      console.error(e);
    }
  };

  // KPI calculations
  const totalBilled = invoices.reduce((acc, i) => acc + (i.totalAmount || 0), 0);
  const totalCollected = invoices.reduce((acc, i) => acc + (i.amountPaid || 0), 0);
  const totalOutstanding = invoices.reduce((acc, i) => acc + (i.amountDue || 0), 0);

  const columns: ColumnDef<InvoiceItem>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <div className="font-bold text-foreground flex items-center gap-1.5">
          <Receipt className="h-3.5 w-3.5 text-emerald-600" />
          <span>{row.original.invoiceNumber}</span>
        </div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.original.customer?.name}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{row.original.customer?.gstin || "GST Unregistered"}</span>
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "Total (₹)",
      cell: ({ row }) => (
        <span className="font-bold text-foreground">
          {formatCurrency(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: "amountPaid",
      header: "Paid (₹)",
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-600">
          {formatCurrency(row.original.amountPaid)}
        </span>
      ),
    },
    {
      accessorKey: "amountDue",
      header: "Balance Due (₹)",
      cell: ({ row }) => (
        <span className={`font-bold ${row.original.amountDue > 0 ? "text-amber-600" : "text-slate-400"}`}>
          {formatCurrency(row.original.amountDue)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = row.original.status;
        const badge =
          st === "paid"
            ? "bg-emerald-100 text-emerald-800"
            : st === "overdue"
            ? "bg-red-100 text-red-800"
            : st === "partial"
            ? "bg-indigo-100 text-indigo-800"
            : "bg-amber-100 text-amber-800";
        return (
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badge}`}>
            {st.toUpperCase()}
          </span>
        );
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => formatDate(row.original.dueDate),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-200">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Invoicing & GST Ledger</h1>
              <p className="text-xs text-muted-foreground">Tax invoices, CGST/SGST/IGST breakdown & payment receipts</p>
            </div>
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Invoice</span>
          </button>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
            <span className="text-xs font-semibold text-muted-foreground">Total Invoiced</span>
            <p className="text-lg font-bold text-foreground mt-0.5">{formatCurrency(totalBilled)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
            <span className="text-xs font-semibold text-muted-foreground">Received Payments</span>
            <p className="text-lg font-bold text-emerald-600 mt-0.5">{formatCurrency(totalCollected)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
            <span className="text-xs font-semibold text-muted-foreground">Outstanding Balance</span>
            <p className="text-lg font-bold text-amber-600 mt-0.5">{formatCurrency(totalOutstanding)}</p>
          </div>
        </div>

        {/* Invoices DataTable */}
        <DataTable
          columns={columns}
          data={invoices}
          searchPlaceholder="Search invoices by number or customer..."
          onRowClick={(inv) => setSelectedInvoice(inv)}
        />

        {/* Invoice Detail Drawer */}
        {selectedInvoice && (
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-border bg-card shadow-2xl animate-in slide-in-from-right">
            {/* Drawer Top */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Receipt className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{selectedInvoice.invoiceNumber}</h3>
                  <span className="text-[11px] text-muted-foreground">{selectedInvoice.customer?.name}</span>
                </div>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Status & Actions Bar */}
            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-6 py-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 uppercase">
                  {selectedInvoice.status}
                </span>
                <span className="text-xs text-muted-foreground">
                  Due {formatDate(selectedInvoice.dueDate)}
                </span>
              </div>

              {selectedInvoice.amountDue > 0 && (
                <button
                  onClick={() => {
                    setPaymentAmount(selectedInvoice.amountDue);
                    setPaymentModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95"
                >
                  <CreditCard className="h-3.5 w-3.5" />
                  <span>Record Payment</span>
                </button>
              )}
            </div>

            {/* Invoice Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer & Tax Breakdown */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border bg-muted/20 p-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Customer:</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedInvoice.customer?.name}</p>
                  <p className="text-muted-foreground font-mono">GSTIN: {selectedInvoice.customer?.gstin || "27AAACR1234A1ZP"}</p>
                  <p className="text-muted-foreground">{selectedInvoice.customer?.city}, {selectedInvoice.customer?.state || "India"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Invoice Dates:</span>
                  <p className="text-muted-foreground mt-0.5">Issue Date: <strong className="text-foreground">{formatDate(selectedInvoice.issueDate)}</strong></p>
                  <p className="text-muted-foreground">Due Date: <strong className="text-foreground">{formatDate(selectedInvoice.dueDate)}</strong></p>
                  <p className="text-muted-foreground">Payment Terms: <strong className="text-foreground">{selectedInvoice.paymentTerms}</strong></p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-hidden rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Item Description</th>
                      <th className="px-3 py-2 text-right">HSN/SAC</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedInvoice.lines?.map((l) => (
                      <tr key={l.id}>
                        <td className="px-3 py-2 font-medium text-foreground">{l.description}</td>
                        <td className="px-3 py-2 text-right font-mono text-[11px] text-muted-foreground">{l.hsnCode || "997331"}</td>
                        <td className="px-3 py-2 text-right">{l.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(l.unitPrice)}</td>
                        <td className="px-3 py-2 text-right font-bold text-foreground">{formatCurrency(l.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Indian GST Tax Breakdown */}
              <div className="flex justify-end">
                <div className="w-72 space-y-1.5 rounded-xl border border-border bg-muted/20 p-3 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxable Subtotal:</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  {selectedInvoice.cgstAmount > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>CGST (9%):</span>
                      <span>{formatCurrency(selectedInvoice.cgstAmount)}</span>
                    </div>
                  )}
                  {selectedInvoice.sgstAmount > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>SGST (9%):</span>
                      <span>{formatCurrency(selectedInvoice.sgstAmount)}</span>
                    </div>
                  )}
                  {selectedInvoice.igstAmount > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>IGST (18%):</span>
                      <span>{formatCurrency(selectedInvoice.igstAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-1 font-bold text-foreground">
                    <span>Total Amount:</span>
                    <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Amount Paid:</span>
                    <span>{formatCurrency(selectedInvoice.amountPaid)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/80 pt-1 font-extrabold text-foreground">
                    <span>Amount Due:</span>
                    <span className="text-amber-600">{formatCurrency(selectedInvoice.amountDue)}</span>
                  </div>
                </div>
              </div>

              {/* Payments History List */}
              {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                <div className="space-y-2 border-t border-border pt-4">
                  <h4 className="font-bold text-xs text-foreground">Payment Transactions</h4>
                  <div className="space-y-1.5">
                    {selectedInvoice.payments.map((p) => (
                      <div key={p.id} className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/40 p-2.5 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <div>
                            <span className="font-bold text-foreground">{p.paymentNumber}</span>
                            <span className="text-[11px] text-muted-foreground ml-2">via {p.paymentMethod}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-700">{formatCurrency(p.amount)}</span>
                          <p className="text-[10px] text-muted-foreground">{formatDate(p.paymentDate)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Record Payment Modal */}
        {paymentModalOpen && selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Record Payment</h3>
                </div>
                <button onClick={() => setPaymentModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="p-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Invoice</label>
                  <input
                    type="text"
                    disabled
                    value={`${selectedInvoice.invoiceNumber} (${selectedInvoice.customer?.name})`}
                    className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    max={selectedInvoice.amountDue}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="Razorpay">Razorpay Payment Gateway</option>
                    <option value="Cheque">Cheque Deposit</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Reference / UTR Number</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR-HDFC-998822"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm"
                  >
                    Confirm Payment Receipt
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
