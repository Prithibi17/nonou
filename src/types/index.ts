export type ViewMode = 'list' | 'kanban' | 'calendar' | 'activity' | 'form' | 'pivot' | 'table';

export type UserRole =
  | 'Administrator / Owner'
  | 'General Manager'
  | 'Sales Manager'
  | 'Sales Employee'
  | 'Finance Manager'
  | 'Accountant'
  | 'HR Manager'
  | 'Employee'
  | 'Inventory Manager'
  | 'Warehouse Staff'
  | 'Project Manager'
  | 'Project Member'
  | 'Helpdesk Manager'
  | 'Support Agent'
  | 'Portal Customer'
  | 'Portal Vendor'
  | string;

export interface EnterprisePermission {
  id?: string;
  module: string;
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
  recordScope: 'own' | 'team' | 'department' | 'branch' | 'organization';
  maxApprovalAmount?: number | null;
  fieldRestrictionsJson?: string | null;
}

export interface UserSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  branchId?: string | null;
  branchName?: string | null;
  department?: string | null;
  team?: string | null;
  portalType?: string | null;
  role: {
    id: string;
    name: string;
    description?: string | null;
    isSystem: boolean;
  };
  permissions: EnterprisePermission[];
  currency: string;
  currencySymbol: string;
  dateFormat: string;
  timezone: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

// ----------------------------------------------------
// UNIVERSAL FILTER ENGINE TYPES
// ----------------------------------------------------

export type FilterOperator =
  // Text
  | 'contains'
  | 'not_contains'
  | 'equals'
  | 'not_equals'
  | 'starts_with'
  | 'ends_with'
  // Number & Currency
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'between'
  // Date
  | 'today'
  | 'yesterday'
  | 'tomorrow'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | 'this_quarter'
  | 'this_year'
  | 'last_30_days'
  | 'next_30_days'
  | 'date_between'
  // Boolean & Relation
  | 'is_true'
  | 'is_false'
  | 'is_set'
  | 'is_not_set'
  | 'in'
  | 'not_in';

export interface FilterCondition {
  id: string;
  field: string;
  operator: FilterOperator;
  value?: any;
  valueTo?: any; // For between ranges
}

export interface FilterGroup {
  id: string;
  operator: 'AND' | 'OR';
  conditions: (FilterCondition | FilterGroup)[];
}

export interface FilterQuery {
  root: FilterGroup;
}

export interface FieldDefinition {
  name: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'boolean' | 'select' | 'user_ref' | 'status';
  options?: { label: string; value: string; color?: string }[];
}

// ----------------------------------------------------
// UNIVERSAL RECORD, CHATTER & ACTIVITIES
// ----------------------------------------------------

export type ActivityType = 'call' | 'meeting' | 'email' | 'follow_up' | 'todo' | 'upload';

export interface ActivityItem {
  id: string;
  recordType: string;
  recordId: string;
  activityType: ActivityType;
  summary: string;
  notes?: string | null;
  dueDate: string;
  isDone: boolean;
  doneAt?: string | null;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  } | null;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  recordType: string;
  recordId: string;
  content: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  recordType: string;
  recordId: string;
  action: string;
  fieldName?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
}

export interface CustomFieldDefinition {
  id: string;
  modelName: string;
  name: string;
  label: string;
  fieldType: string;
  isRequired: boolean;
  defaultValue?: string | null;
  options?: string[];
  position: number;
}

// ----------------------------------------------------
// AUTOMATION ENGINE
// ----------------------------------------------------

export type AutomationTrigger =
  | 'record_created'
  | 'record_updated'
  | 'stage_changed'
  | 'field_changed'
  | 'overdue'
  | 'status_changed';

export interface AutomationAction {
  type: 'update_field' | 'send_notification' | 'create_activity' | 'assign_user' | 'add_tag';
  params: Record<string, any>;
}

export interface AutomationRuleItem {
  id: string;
  name: string;
  modelName: string;
  triggerType: AutomationTrigger;
  conditions: FilterGroup;
  actions: AutomationAction[];
  isActive: boolean;
  createdAt: string;
}

// ----------------------------------------------------
// CRM & PIPELINES
// ----------------------------------------------------

export interface CRMStageItem {
  id: string;
  name: string;
  sequence: number;
  probability: number;
  isWon: boolean;
  isLost: boolean;
  color: string;
}

export interface LeadItem {
  id: string;
  name: string;
  companyName?: string | null;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  source: string;
  campaign?: string | null;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  expectedRevenue: number;
  probability: number;
  stageId: string;
  stage?: CRMStageItem;
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  tags?: string | null;
  notes?: string | null;
  lostReason?: string | null;
  expectedClosing?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// SALES & INVOICES
// ----------------------------------------------------

export interface QuotationLineItem {
  id: string;
  productId?: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  product?: {
    id: string;
    name: string;
    sku: string;
  } | null;
}

export interface QuotationItem {
  id: string;
  quotationNumber: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    companyName?: string | null;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    gstin?: string | null;
  };
  status: 'draft' | 'sent' | 'approved' | 'confirmed' | 'cancelled' | 'invoiced';
  issueDate: string;
  expiryDate?: string | null;
  paymentTerms: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string | null;
  termsAndConditions?: string | null;
  convertedToInvoiceId?: string | null;
  lines: QuotationLineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  productId?: string | null;
  description: string;
  hsnCode?: string | null;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  taxAmount: number;
  lineTotal: number;
  product?: {
    id: string;
    name: string;
    sku: string;
  } | null;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer?: {
    id: string;
    name: string;
    companyName?: string | null;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    state?: string | null;
    gstin?: string | null;
  };
  quotationId?: string | null;
  status: 'draft' | 'posted' | 'paid' | 'partial' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  subtotal: number;
  taxAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  notes?: string | null;
  lines: InvoiceLineItem[];
  payments?: PaymentItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentItem {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string | null;
  paymentDate: string;
  notes?: string | null;
  createdAt: string;
}

// ----------------------------------------------------
// PRODUCTS & CONTACTS
// ----------------------------------------------------

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
  categoryId?: string | null;
  category?: { id: string; name: string } | null;
  productType: 'storable' | 'service' | 'consumable';
  image?: string | null;
  sellingPrice: number;
  costPrice: number;
  taxRate: number;
  hsnCode?: string | null;
  stockOnHand: number;
  reorderLevel: number;
  uom: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactItem {
  id: string;
  type: 'individual' | 'company';
  name: string;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  isCustomer: boolean;
  isVendor: boolean;
  gstin?: string | null;
  pan?: string | null;
  website?: string | null;
  street?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  creditLimit: number;
  tags?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------
// PROJECTS & TASKS
// ----------------------------------------------------

export interface ProjectStageItem {
  id: string;
  projectId: string;
  name: string;
  sequence: number;
  color: string;
}

export interface TaskItem {
  id: string;
  projectId: string;
  project?: { id: string; name: string; code: string };
  stageId: string;
  stage?: ProjectStageItem;
  title: string;
  description?: string | null;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  startDate?: string | null;
  dueDate?: string | null;
  estimatedHours: number;
  actualHours: number;
  assignedToId?: string | null;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  tags?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  customerId?: string | null;
  customer?: { id: string; name: string } | null;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  startDate?: string | null;
  targetEndDate?: string | null;
  budget: number;
  stages: ProjectStageItem[];
  tasks?: TaskItem[];
  createdAt: string;
  updatedAt: string;
}
