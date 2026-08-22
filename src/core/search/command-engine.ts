export interface SearchResultItem {
  id: string;
  type: 'contact' | 'lead' | 'quotation' | 'invoice' | 'product' | 'project' | 'task' | 'action' | 'navigation';
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  url: string;
  iconName: string;
}

export const SYSTEM_NAVIGATION_COMMANDS = [
  {
    id: "nav-dashboard",
    type: "navigation" as const,
    title: "Go to Dashboard",
    subtitle: "Executive KPI metrics & analytics",
    url: "/dashboard",
    iconName: "LayoutDashboard",
  },
  {
    id: "nav-crm",
    type: "navigation" as const,
    title: "Go to CRM & Leads",
    subtitle: "Manage deal pipelines & opportunities",
    url: "/crm",
    iconName: "Target",
  },
  {
    id: "nav-sales",
    type: "navigation" as const,
    title: "Go to Sales & Quotations",
    subtitle: "Quotations, orders & approvals",
    url: "/sales",
    iconName: "FileText",
  },
  {
    id: "nav-invoices",
    type: "navigation" as const,
    title: "Go to Invoicing & Payments",
    subtitle: "Invoices, GST breakdown & payments",
    url: "/invoices",
    iconName: "Receipt",
  },
  {
    id: "nav-products",
    type: "navigation" as const,
    title: "Go to Products Catalog",
    subtitle: "Products, SKUs, inventory & pricing",
    url: "/products",
    iconName: "Package",
  },
  {
    id: "nav-projects",
    type: "navigation" as const,
    title: "Go to Projects & Tasks",
    subtitle: "Project management, tasks & milestones",
    url: "/projects",
    iconName: "FolderKanban",
  },
  {
    id: "nav-contacts",
    type: "navigation" as const,
    title: "Go to Contacts Directory",
    subtitle: "Customers, vendors & partners",
    url: "/contacts",
    iconName: "Users",
  },
  {
    id: "nav-apps",
    type: "navigation" as const,
    title: "Go to App Marketplace",
    subtitle: "Install & configure business modules",
    url: "/apps",
    iconName: "Grid",
  },
  {
    id: "nav-settings",
    type: "navigation" as const,
    title: "Go to Organization Settings",
    subtitle: "Branches, roles, custom fields & audit logs",
    url: "/settings",
    iconName: "Settings",
  },
];

export const SYSTEM_ACTION_COMMANDS = [
  {
    id: "act-create-lead",
    type: "action" as const,
    title: "Create New Lead / Opportunity",
    subtitle: "Command: /new lead",
    url: "/crm?action=new",
    iconName: "PlusCircle",
  },
  {
    id: "act-create-quote",
    type: "action" as const,
    title: "Create New Quotation",
    subtitle: "Command: /create quote",
    url: "/sales?action=new",
    iconName: "PlusCircle",
  },
  {
    id: "act-create-invoice",
    type: "action" as const,
    title: "Create New Invoice",
    subtitle: "Command: /create invoice",
    url: "/invoices?action=new",
    iconName: "PlusCircle",
  },
  {
    id: "act-create-product",
    type: "action" as const,
    title: "Add New Product",
    subtitle: "Command: /new product",
    url: "/products?action=new",
    iconName: "PlusCircle",
  },
  {
    id: "act-create-task",
    type: "action" as const,
    title: "Create New Task",
    subtitle: "Command: /new task",
    url: "/projects?action=new",
    iconName: "PlusCircle",
  },
  {
    id: "act-create-contact",
    type: "action" as const,
    title: "Create New Contact / Customer",
    subtitle: "Command: /new contact",
    url: "/contacts?action=new",
    iconName: "PlusCircle",
  },
];
