-- ==============================================================================
-- BusinessOS: Complete PostgreSQL Schema for Supabase
-- Project: tmtndehzfmolvsslness
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Organizations & Multi-Tenancy Hierarchy
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo TEXT,
    industry TEXT DEFAULT 'General',
    company_size TEXT DEFAULT '1-10',
    country TEXT DEFAULT 'India',
    state TEXT,
    currency TEXT DEFAULT 'INR',
    currency_symbol TEXT DEFAULT '₹',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    gstin TEXT,
    pan TEXT,
    website TEXT,
    phone TEXT,
    address TEXT,
    fiscal_year_start TEXT DEFAULT '04-01',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    is_main BOOLEAN DEFAULT false,
    address TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    module TEXT NOT NULL,
    can_view BOOLEAN DEFAULT true,
    can_create BOOLEAN DEFAULT true,
    can_edit BOOLEAN DEFAULT true,
    can_delete BOOLEAN DEFAULT false,
    can_export BOOLEAN DEFAULT true,
    can_import BOOLEAN DEFAULT false,
    can_approve BOOLEAN DEFAULT false,
    can_configure BOOLEAN DEFAULT false,
    UNIQUE(role_id, module)
);

CREATE TABLE IF NOT EXISTS public.organization_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role_id UUID NOT NULL REFERENCES public.roles(id),
    default_branch_id UUID REFERENCES public.branches(id),
    status TEXT DEFAULT 'active',
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    UNIQUE(organization_id, user_id)
);

-- 3. Universal Record Engines (Custom Fields, Activities, Chatter, Audit)
CREATE TABLE IF NOT EXISTS public.custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    model_name TEXT NOT NULL,
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    field_type TEXT NOT NULL,
    is_required BOOLEAN DEFAULT false,
    default_value TEXT,
    options_json JSONB,
    position INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, model_name, name)
);

CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL,
    record_id TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    summary TEXT NOT NULL,
    notes TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    is_done BOOLEAN DEFAULT false,
    done_at TIMESTAMPTZ,
    assigned_to_id UUID,
    created_by_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL,
    record_id TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    record_type TEXT NOT NULL,
    record_id TEXT NOT NULL,
    action TEXT NOT NULL,
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    user_id UUID,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.saved_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    model_name TEXT NOT NULL,
    name TEXT NOT NULL,
    filter_json JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    model_name TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    conditions_json JSONB NOT NULL,
    actions_json JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Contacts & Directory
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id),
    type TEXT DEFAULT 'individual',
    name TEXT NOT NULL,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    mobile TEXT,
    is_customer BOOLEAN DEFAULT true,
    is_vendor BOOLEAN DEFAULT false,
    gstin TEXT,
    pan TEXT,
    website TEXT,
    street TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'India',
    credit_limit NUMERIC(15, 2) DEFAULT 0,
    tags TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 5. Product Master & Catalog
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.product_categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    barcode TEXT,
    category_id UUID REFERENCES public.product_categories(id),
    product_type TEXT DEFAULT 'storable',
    selling_price NUMERIC(15, 2) DEFAULT 0,
    cost_price NUMERIC(15, 2) DEFAULT 0,
    tax_rate NUMERIC(5, 2) DEFAULT 18.0,
    hsn_code TEXT,
    stock_on_hand INT DEFAULT 0,
    reorder_level INT DEFAULT 5,
    uom TEXT DEFAULT 'Units',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, sku)
);

-- 6. CRM (Leads & Opportunities)
CREATE TABLE IF NOT EXISTS public.crm_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sequence INT DEFAULT 0,
    probability INT DEFAULT 10,
    is_won BOOLEAN DEFAULT false,
    is_lost BOOLEAN DEFAULT false,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id),
    name TEXT NOT NULL,
    company_name TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    source TEXT DEFAULT 'Website',
    campaign TEXT,
    priority TEXT DEFAULT 'Medium',
    expected_revenue NUMERIC(15, 2) DEFAULT 0,
    probability INT DEFAULT 10,
    stage_id UUID NOT NULL REFERENCES public.crm_stages(id),
    assigned_to_id UUID,
    tags TEXT,
    notes TEXT,
    lost_reason TEXT,
    expected_closing TIMESTAMPTZ,
    is_converted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 7. Sales (Quotations & Orders)
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id),
    quotation_number TEXT NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.contacts(id),
    status TEXT DEFAULT 'draft',
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    expiry_date TIMESTAMPTZ,
    payment_terms TEXT DEFAULT 'Immediate',
    subtotal NUMERIC(15, 2) DEFAULT 0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    discount_amount NUMERIC(15, 2) DEFAULT 0,
    total_amount NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    terms_and_conditions TEXT,
    converted_to_invoice_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, quotation_number)
);

CREATE TABLE IF NOT EXISTS public.quotation_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 1,
    unit_price NUMERIC(15, 2) DEFAULT 0,
    discount_percent NUMERIC(5, 2) DEFAULT 0,
    tax_rate NUMERIC(5, 2) DEFAULT 18.0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    line_total NUMERIC(15, 2) DEFAULT 0
);

-- 8. Invoicing & Payments
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id),
    invoice_number TEXT NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.contacts(id),
    quotation_id UUID REFERENCES public.quotations(id),
    status TEXT DEFAULT 'posted',
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    payment_terms TEXT DEFAULT '30 Days',
    subtotal NUMERIC(15, 2) DEFAULT 0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    cgst_amount NUMERIC(15, 2) DEFAULT 0,
    sgst_amount NUMERIC(15, 2) DEFAULT 0,
    igst_amount NUMERIC(15, 2) DEFAULT 0,
    discount_amount NUMERIC(15, 2) DEFAULT 0,
    total_amount NUMERIC(15, 2) DEFAULT 0,
    amount_paid NUMERIC(15, 2) DEFAULT 0,
    amount_due NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(organization_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS public.invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    description TEXT NOT NULL,
    hsn_code TEXT,
    quantity NUMERIC(10, 2) DEFAULT 1,
    unit_price NUMERIC(15, 2) DEFAULT 0,
    discount_percent NUMERIC(5, 2) DEFAULT 0,
    tax_rate NUMERIC(5, 2) DEFAULT 18.0,
    tax_amount NUMERIC(15, 2) DEFAULT 0,
    line_total NUMERIC(15, 2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.contacts(id),
    payment_number TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    payment_method TEXT DEFAULT 'Bank Transfer',
    reference_number TEXT,
    payment_date TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Projects & Tasks
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    customer_id UUID REFERENCES public.contacts(id),
    manager_id UUID,
    status TEXT DEFAULT 'active',
    start_date TIMESTAMPTZ,
    target_end_date TIMESTAMPTZ,
    budget NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.project_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sequence INT DEFAULT 0,
    color TEXT DEFAULT '#6366f1'
);

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL REFERENCES public.project_stages(id),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'todo',
    due_date TIMESTAMPTZ,
    estimated_hours NUMERIC(8, 2) DEFAULT 0,
    actual_hours NUMERIC(8, 2) DEFAULT 0,
    assigned_to_id UUID,
    tags TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 10. Enable Row Level Security (RLS) on all exposed tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

-- 11. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_org ON public.contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_org ON public.products(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_org ON public.leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON public.leads(stage_id);
CREATE INDEX IF NOT EXISTS idx_quotations_org ON public.quotations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_org ON public.invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_org ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_proj ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_target ON public.activities(organization_id, record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_comments_target ON public.comments(organization_id, record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_target ON public.audit_logs(organization_id, record_type, record_id);
