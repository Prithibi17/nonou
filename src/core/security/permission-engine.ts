/**
 * BusinessOS Enterprise 5-Dimensional RBAC & Record-Level Permission Engine
 *
 * Evaluates access across 5 dimensions:
 * WHO (User / Role / Owner / Portal)
 * WHERE (Organization / Branch / Department / Team)
 * WHAT (Module: CRM, Sales, Invoices, Products, Projects, Contacts, HR, Inventory, Helpdesk, Settings)
 * WHICH RECORD (Scope: own, team, department, branch, organization)
 * ACTION (view, create, edit, delete, approve, assign, share, export, import, configure)
 */

export type AppModuleName =
  | "crm"
  | "sales"
  | "invoices"
  | "products"
  | "projects"
  | "contacts"
  | "inventory"
  | "helpdesk"
  | "hr"
  | "settings"
  | "automation"
  | "portal";

export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "assign"
  | "share"
  | "export"
  | "import"
  | "configure";

export type RecordScope = "own" | "team" | "department" | "branch" | "organization";

export interface PermissionDefinition {
  module: AppModuleName;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canAssign: boolean;
  canShare: boolean;
  canExport: boolean;
  canImport: boolean;
  canConfigure: boolean;
  recordScope: RecordScope;
  maxApprovalAmount?: number | null;
  fieldRestrictions?: string[]; // list of hidden/masked field keys
}

export interface UserSecurityContext {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
  organizationId: string;
  branchId?: string | null;
  department?: string | null;
  team?: string | null;
  portalType?: "customer" | "vendor" | null;
  portalContactId?: string | null;
  role: {
    id: string;
    name: string;
    description?: string | null;
    isSystem: boolean;
  };
  permissions: PermissionDefinition[];
}

export interface StandardRolePreset {
  name: string;
  description: string;
  isOwner?: boolean;
  permissions: Record<AppModuleName, Partial<PermissionDefinition>>;
}

// -----------------------------------------------------------------------------
// 15 Standard Enterprise Roles Matrix
// -----------------------------------------------------------------------------
export const STANDARD_ENTERPRISE_ROLES: StandardRolePreset[] = [
  // 1. Administrator / Owner
  {
    name: "Administrator / Owner",
    description: "Sole organization owner. Full access across all apps, branches, users, and audit logs. (Only 1 per organization)",
    isOwner: true,
    permissions: {
      crm: { canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization" },
      sales: { canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization" },
      invoices: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization" }, // Posted invoices cannot be hard deleted
      products: { canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization" },
      projects: { canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization" },
      contacts: { canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization" },
      inventory: { canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization" },
      helpdesk: { canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization" },
      hr: { canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization" },
      settings: { canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization" },
      automation: { canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization" },
      portal: { canView: true, canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization" },
    },
  },

  // 2. General Manager
  {
    name: "General Manager",
    description: "Operational leadership. Access to operational apps and reports across all branches. No access to owner billing, secrets, or system deletion.",
    permissions: {
      crm: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: false, recordScope: "organization" },
      sales: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: false, recordScope: "organization" },
      invoices: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: false, canConfigure: false, recordScope: "organization" },
      products: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: false, recordScope: "organization" },
      projects: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: false, recordScope: "organization" },
      contacts: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: false, recordScope: "organization" },
      inventory: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: false, recordScope: "organization" },
      helpdesk: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: false, recordScope: "organization" },
      hr: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: true, canAssign: true, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "organization", fieldRestrictions: ["salary", "bankDetails"] },
      settings: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "organization" },
      automation: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "organization" },
      portal: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "organization" },
    },
  },

  // 3. Sales Manager
  {
    name: "Sales Manager",
    description: "Leads sales team. Manages pipeline, discount approvals, team quotations, and customer assignments.",
    permissions: {
      crm: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: false, recordScope: "team" },
      sales: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: false, recordScope: "team", maxApprovalAmount: 500000 },
      invoices: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "team" },
      products: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: true, canImport: false, canConfigure: false, recordScope: "organization", fieldRestrictions: ["costPrice"] },
      projects: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      contacts: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: false, recordScope: "team" },
      inventory: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      helpdesk: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      hr: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      settings: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      automation: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      portal: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
    },
  },

  // 4. Sales Employee
  {
    name: "Sales Employee",
    description: "Works with assigned leads, creates draft quotations, and logs sales activities. Sees own records only.",
    permissions: {
      crm: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      sales: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      invoices: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      products: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "organization", fieldRestrictions: ["costPrice"] },
      projects: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      contacts: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      inventory: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      helpdesk: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      hr: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      settings: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      automation: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      portal: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
    },
  },

  // 5. Finance Manager
  {
    name: "Finance Manager",
    description: "Full financial control. Oversees invoices, vendor bills, tax splits, payments, and ledger entries. (Immutable posted records)",
    permissions: {
      crm: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      sales: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: true, canImport: false, canConfigure: false, recordScope: "organization" },
      invoices: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization", maxApprovalAmount: 5000000 },
      products: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: true, canImport: false, canConfigure: false, recordScope: "organization" },
      projects: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      contacts: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: false, recordScope: "organization" },
      inventory: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: true, canImport: false, canConfigure: false, recordScope: "organization" },
      helpdesk: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      hr: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: true, canAssign: false, canShare: false, canExport: true, canImport: false, canConfigure: false, recordScope: "organization" },
      settings: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      automation: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      portal: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
    },
  },

  // 6. Accountant
  {
    name: "Accountant",
    description: "Processes draft invoices, records payments up to ₹50,000, and manages bank reconciliation.",
    permissions: {
      crm: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      sales: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "organization" },
      invoices: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: true, canImport: false, canConfigure: false, recordScope: "organization", maxApprovalAmount: 50000 },
      products: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "organization" },
      projects: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      contacts: { canView: true, canCreate: true, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "organization" },
      inventory: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      helpdesk: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      hr: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      settings: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      automation: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      portal: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
    },
  },

  // 7. HR Manager
  {
    name: "HR Manager",
    description: "Employee directories, departments, leaves, attendance, payroll, contracts, and recruitment.",
    permissions: {
      crm: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      sales: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      invoices: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      products: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      projects: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      contacts: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      inventory: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      helpdesk: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      hr: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization" },
      settings: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      automation: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      portal: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
    },
  },

  // 8. Normal Employee
  {
    name: "Employee",
    description: "Standard team member. Access to own profile, assigned tasks, own leave/timesheets, and company announcements.",
    permissions: {
      crm: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      sales: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      invoices: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      products: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      projects: { canView: true, canCreate: false, canEdit: true, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      contacts: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      inventory: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      helpdesk: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      hr: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own", fieldRestrictions: ["salary", "contracts"] },
      settings: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      automation: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      portal: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
    },
  },

  // 9. Inventory Manager
  {
    name: "Inventory Manager",
    description: "Product catalog, warehouses, stock levels, transfers, adjustments, and reordering thresholds.",
    permissions: {
      crm: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      sales: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      invoices: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      products: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization" },
      projects: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      contacts: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "organization" },
      inventory: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "organization" },
      helpdesk: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      hr: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      settings: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      automation: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      portal: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
    },
  },

  // 10. Warehouse Staff
  {
    name: "Warehouse Staff",
    description: "Performs stock transfers, receives shipments, and picks/packs orders in assigned warehouse branch only.",
    permissions: {
      crm: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      sales: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      invoices: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      products: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "branch", fieldRestrictions: ["costPrice", "sellingPrice"] },
      projects: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      contacts: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      inventory: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "branch" },
      helpdesk: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      hr: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      settings: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      automation: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      portal: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
    },
  },

  // 11. Project Manager
  {
    name: "Project Manager",
    description: "Manages projects, milestones, task assignments, timesheets, and project team members.",
    permissions: {
      crm: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      sales: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      invoices: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      products: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "organization" },
      projects: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "team" },
      contacts: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "organization" },
      inventory: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      helpdesk: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      hr: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      settings: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      automation: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      portal: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
    },
  },

  // 12. Project Member
  {
    name: "Project Member",
    description: "Executes tasks, logs timesheets, and posts comments in assigned projects.",
    permissions: {
      crm: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      sales: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      invoices: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      products: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "organization" },
      projects: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      contacts: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      inventory: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      helpdesk: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      hr: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      settings: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      automation: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      portal: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
    },
  },

  // 13. Helpdesk Manager
  {
    name: "Helpdesk Manager",
    description: "Support ticket queues, SLAs, ticket assignments, customer CSAT, and agent performance.",
    permissions: {
      crm: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      sales: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      invoices: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      products: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "organization" },
      projects: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      contacts: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: false, recordScope: "organization" },
      inventory: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      helpdesk: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: true, canAssign: true, canShare: true, canExport: true, canImport: true, canConfigure: true, recordScope: "team" },
      hr: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      settings: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      automation: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      portal: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
    },
  },

  // 14. Support Agent
  {
    name: "Support Agent",
    description: "Resolves assigned customer support tickets and logs activities. Cannot see company finances or HR.",
    permissions: {
      crm: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      sales: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      invoices: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      products: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "organization" },
      projects: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      contacts: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "team" },
      inventory: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      helpdesk: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      hr: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      settings: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      automation: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      portal: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
    },
  },

  // 15. Portal Customer
  {
    name: "Portal Customer",
    description: "Highly restricted external customer access. Only sees own quotations, orders, invoices, and tickets.",
    permissions: {
      crm: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      sales: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: true, canAssign: false, canShare: false, canExport: true, canImport: false, canConfigure: false, recordScope: "own" }, // Can accept/approve quote
      invoices: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: true, canImport: false, canConfigure: false, recordScope: "own" },
      products: { canView: true, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "organization", fieldRestrictions: ["costPrice", "stockOnHand"] },
      projects: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      contacts: { canView: true, canCreate: false, canEdit: true, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" }, // Can edit own profile
      inventory: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      helpdesk: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      hr: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      settings: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      automation: { canView: false, canCreate: false, canEdit: false, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
      portal: { canView: true, canCreate: true, canEdit: true, canDelete: false, canApprove: false, canAssign: false, canShare: false, canExport: false, canImport: false, canConfigure: false, recordScope: "own" },
    },
  },
];

// -----------------------------------------------------------------------------
// Security Evaluation Functions
// -----------------------------------------------------------------------------

/**
 * Evaluates whether a user can perform an action on a module
 */
export function evaluatePermission(
  ctx: UserSecurityContext | null | undefined,
  module: AppModuleName,
  action: PermissionAction,
  record?: any
): boolean {
  if (!ctx) return false;

  // Organization Administrator / Owner has full access (except immutable rules)
  const isOwner = ctx.role.name === "Administrator / Owner" || ctx.role.name === "Administrator" || ctx.isSuperAdmin;

  if (action === "delete" && (module === "invoices" || module === "sales")) {
    // Posted/Paid invoices cannot be hard deleted by anyone
    if (record && (record.status === "posted" || record.status === "paid")) {
      return false;
    }
  }

  if (isOwner) return true;

  // Find module permission
  const perm = ctx.permissions.find((p) => p.module === module);
  if (!perm) return false;

  // Check action flag
  let allowed = false;
  switch (action) {
    case "view":
      allowed = perm.canView;
      break;
    case "create":
      allowed = perm.canCreate;
      break;
    case "edit":
      allowed = perm.canEdit;
      break;
    case "delete":
      allowed = perm.canDelete;
      break;
    case "approve":
      allowed = perm.canApprove;
      if (allowed && perm.maxApprovalAmount && record?.totalAmount) {
        allowed = record.totalAmount <= perm.maxApprovalAmount;
      }
      break;
    case "assign":
      allowed = perm.canAssign;
      break;
    case "share":
      allowed = perm.canShare;
      break;
    case "export":
      allowed = perm.canExport;
      break;
    case "import":
      allowed = perm.canImport;
      break;
    case "configure":
      allowed = perm.canConfigure;
      break;
  }

  if (!allowed) return false;

  // If a specific record is passed, evaluate record-level scope ownership
  if (record) {
    return evaluateRecordScope(ctx, perm.recordScope, record);
  }

  return true;
}

/**
 * Checks record-level scope matches user context
 */
export function evaluateRecordScope(
  ctx: UserSecurityContext,
  scope: RecordScope,
  record: any
): boolean {
  if (scope === "organization") return true;

  if (scope === "branch") {
    if (!ctx.branchId) return true;
    return record.branchId === ctx.branchId || !record.branchId;
  }

  if (scope === "department") {
    if (!ctx.department) return true;
    return record.department === ctx.department;
  }

  if (scope === "team") {
    if (!ctx.team) return true;
    return record.team === ctx.team || record.assignedToId === ctx.userId || record.ownerUserId === ctx.userId;
  }

  if (scope === "own") {
    return Boolean(
      record.assignedToId === ctx.userId ||
      record.ownerUserId === ctx.userId ||
      record.createdById === ctx.userId ||
      record.userId === ctx.userId ||
      (ctx.portalContactId && record.customerId === ctx.portalContactId)
    );
  }

  return false;
}

/**
 * Generates a Prisma WHERE filter restricting queries to user's record scope
 */
export function buildPrismaRecordFilter(
  ctx: UserSecurityContext,
  module: AppModuleName
): Record<string, any> {
  const baseFilter: Record<string, any> = {
    organizationId: ctx.organizationId,
  };

  const isOwner = ctx.role.name === "Administrator / Owner" || ctx.role.name === "Administrator" || ctx.isSuperAdmin;
  if (isOwner) return baseFilter;

  const perm = ctx.permissions.find((p) => p.module === module);
  if (!perm || !perm.canView) {
    // No access at all: return impossible filter
    return { id: "impossible-id-no-permission" };
  }

  switch (perm.recordScope) {
    case "organization":
      return baseFilter;

    case "branch":
      if (ctx.branchId) {
        return {
          ...baseFilter,
          OR: [{ branchId: ctx.branchId }, { branchId: null }],
        };
      }
      return baseFilter;

    case "department":
      if (ctx.department) {
        return {
          ...baseFilter,
          department: ctx.department,
        };
      }
      return baseFilter;

    case "team":
      if (ctx.team) {
        return {
          ...baseFilter,
          OR: [
            { team: ctx.team },
            { assignedToId: ctx.userId },
            { ownerUserId: ctx.userId },
          ],
        };
      }
      return {
        ...baseFilter,
        OR: [{ assignedToId: ctx.userId }, { ownerUserId: ctx.userId }],
      };

    case "own":
      if (ctx.portalContactId) {
        return {
          ...baseFilter,
          customerId: ctx.portalContactId,
        };
      }
      return {
        ...baseFilter,
        OR: [
          { assignedToId: ctx.userId },
          { ownerUserId: ctx.userId },
          { createdById: ctx.userId },
          { userId: ctx.userId },
        ],
      };

    default:
      return baseFilter;
  }
}

/**
 * Seeds all 15 enterprise roles and permissions for an organization
 */
export async function seedStandardRolesForOrg(prismaClient: any, organizationId: string) {
  for (const preset of STANDARD_ENTERPRISE_ROLES) {
    // Check if role exists
    let role = await prismaClient.role.findFirst({
      where: {
        organizationId,
        name: preset.name,
      },
    });

    if (!role) {
      role = await prismaClient.role.create({
        data: {
          organizationId,
          name: preset.name,
          description: preset.description,
          isSystem: true,
        },
      });
    }

    // Create/update module permissions
    const modules: AppModuleName[] = [
      "crm",
      "sales",
      "invoices",
      "products",
      "projects",
      "contacts",
      "inventory",
      "helpdesk",
      "hr",
      "settings",
      "automation",
      "portal",
    ];

    for (const mod of modules) {
      const p = preset.permissions[mod] || {};
      await prismaClient.permission.upsert({
        where: {
          roleId_module: {
            roleId: role.id,
            module: mod,
          },
        },
        update: {
          canView: p.canView ?? false,
          canCreate: p.canCreate ?? false,
          canEdit: p.canEdit ?? false,
          canDelete: p.canDelete ?? false,
          canApprove: p.canApprove ?? false,
          canAssign: p.canAssign ?? false,
          canShare: p.canShare ?? false,
          canExport: p.canExport ?? false,
          canImport: p.canImport ?? false,
          canConfigure: p.canConfigure ?? false,
          recordScope: p.recordScope || "own",
          maxApprovalAmount: p.maxApprovalAmount || null,
          fieldRestrictionsJson: p.fieldRestrictions ? JSON.stringify(p.fieldRestrictions) : null,
        },
        create: {
          roleId: role.id,
          module: mod,
          canView: p.canView ?? false,
          canCreate: p.canCreate ?? false,
          canEdit: p.canEdit ?? false,
          canDelete: p.canDelete ?? false,
          canApprove: p.canApprove ?? false,
          canAssign: p.canAssign ?? false,
          canShare: p.canShare ?? false,
          canExport: p.canExport ?? false,
          canImport: p.canImport ?? false,
          canConfigure: p.canConfigure ?? false,
          recordScope: p.recordScope || "own",
          maxApprovalAmount: p.maxApprovalAmount || null,
          fieldRestrictionsJson: p.fieldRestrictions ? JSON.stringify(p.fieldRestrictions) : null,
        },
      });
    }
  }
}
