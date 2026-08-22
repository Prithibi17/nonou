"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/core/shell/AppShell";
import { DataTable } from "@/components/core/data-table/DataTable";
import { ChatterPanel } from "@/components/core/chatter/ChatterPanel";
import {
  Users,
  Plus,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Receipt,
  X,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ContactItem } from "@/types";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    type: "company",
    email: "",
    phone: "",
    isCustomer: true,
    isVendor: false,
    gstin: "",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    creditLimit: 1000000,
  });

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/contacts");
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleContactClick = async (contact: any) => {
    try {
      const res = await fetch(`/api/contacts?id=${contact.id}`);
      const data = await res.json();
      setSelectedContact(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setModalOpen(false);
      fetchContacts();
    } catch (e) {
      console.error(e);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Contact / Company",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
            {row.original.type === "company" ? <Building2 className="h-4 w-4" /> : <Users className="h-4 w-4" />}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{row.original.name}</span>
            {row.original.companyName && (
              <span className="text-[10px] text-muted-foreground">{row.original.companyName}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.original.email || "-",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || "-",
    },
    {
      accessorKey: "gstin",
      header: "GSTIN",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.gstin || "Unregistered"}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Tags",
      cell: ({ row }) => (
        <div className="flex gap-1">
          {row.original.isCustomer && (
            <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-800">
              Customer
            </span>
          )}
          {row.original.isVendor && (
            <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[9px] font-bold text-purple-800">
              Vendor
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "city",
      header: "City / State",
      cell: ({ row }) => (
        <span>
          {row.original.city ? `${row.original.city}, ${row.original.state || ""}` : "-"}
        </span>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 border border-rose-200">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Contacts & Directory</h1>
              <p className="text-xs text-muted-foreground">
                360° Customer, Vendor & Partner Relationship Profiles
              </p>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand-700 shadow-sm transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Contact</span>
          </button>
        </div>

        {/* Contacts Table */}
        <DataTable
          columns={columns}
          data={contacts}
          searchPlaceholder="Search contacts by name, email, phone or GSTIN..."
          onRowClick={(contact) => handleContactClick(contact)}
        />

        {/* Contact 360 Detail Drawer */}
        {selectedContact && (
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col border-l border-border bg-card shadow-2xl animate-in slide-in-from-right">
            {/* Top */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600">
                  {selectedContact.type === "company" ? <Building2 className="h-4 w-4" /> : <Users className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">{selectedContact.name}</h3>
                  <span className="text-[11px] text-muted-foreground">{selectedContact.email || "No email on file"}</span>
                </div>
              </div>
              <button onClick={() => setSelectedContact(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 360 Metrics Cards */}
            <div className="grid grid-cols-3 gap-2 border-b border-border p-4 bg-card">
              <div className="rounded-xl border border-border p-2.5 text-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Quotations</span>
                <p className="text-sm font-bold text-blue-600 mt-0.5">{selectedContact.quotations?.length || 0}</p>
              </div>
              <div className="rounded-xl border border-border p-2.5 text-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Invoices</span>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">{selectedContact.invoices?.length || 0}</p>
              </div>
              <div className="rounded-xl border border-border p-2.5 text-center">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Credit Limit</span>
                <p className="text-sm font-bold text-foreground mt-0.5">{formatCurrency(selectedContact.creditLimit || 0)}</p>
              </div>
            </div>

            {/* Address & Meta */}
            <div className="p-4 border-b border-border text-xs space-y-1 bg-muted/20">
              <p className="text-muted-foreground">GSTIN: <strong className="text-foreground font-mono">{selectedContact.gstin || "N/A"}</strong></p>
              <p className="text-muted-foreground">Phone: <strong className="text-foreground">{selectedContact.phone || "-"}</strong></p>
              <p className="text-muted-foreground">Address: <strong className="text-foreground">{selectedContact.street || ""}, {selectedContact.city}, {selectedContact.state}, {selectedContact.country}</strong></p>
            </div>

            {/* Chatter */}
            <div className="flex-1 overflow-hidden">
              <ChatterPanel
                recordType="contact"
                recordId={selectedContact.id}
                recordTitle={selectedContact.name}
              />
            </div>
          </div>
        )}

        {/* Add Contact Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-600 text-white">
                    <Users className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Create New Contact</h3>
                </div>
                <button onClick={() => setModalOpen(false)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateContact} className="p-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Contact / Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tata Consultancy Services"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="vendor@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Phone</label>
                    <input
                      type="text"
                      placeholder="+91 98765 00000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">GSTIN</label>
                    <input
                      type="text"
                      placeholder="29AAAAA0000A1Z5"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-brand-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1">Credit Limit (₹)</label>
                    <input
                      type="number"
                      value={formData.creditLimit}
                      onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
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
                    Create Contact
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
