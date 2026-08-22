import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedDatabase() {
  console.log("🌱 Starting BusinessOS database seeding...");

  // 1. Clean existing records
  await prisma.comment.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.savedFilter.deleteMany({});
  await prisma.automationRule.deleteMany({});
  await prisma.customFieldValue.deleteMany({});
  await prisma.customField.deleteMany({});
  await prisma.timesheet.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.projectStage.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.invoiceLine.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.quotationLine.deleteMany({});
  await prisma.quotation.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.cRMStage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.organizationApp.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.organizationUser.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.branch.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Core Users
  const prithibi = await prisma.user.create({
    data: {
      email: "prithibi@techcorp.in",
      passwordHash: "demo_hash_password_123",
      firstName: "Prithibi",
      lastName: "Mandi",
      phone: "+91 98765 43210",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      isSuperAdmin: true,
    },
  });

  const rahul = await prisma.user.create({
    data: {
      email: "rahul@techcorp.in",
      passwordHash: "demo_hash_password_123",
      firstName: "Rahul",
      lastName: "Sharma",
      phone: "+91 98765 11223",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  const priya = await prisma.user.create({
    data: {
      email: "priya@techcorp.in",
      passwordHash: "demo_hash_password_123",
      firstName: "Priya",
      lastName: "Nair",
      phone: "+91 98765 99887",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  });

  const amit = await prisma.user.create({
    data: {
      email: "amit@techcorp.in",
      passwordHash: "demo_hash_password_123",
      firstName: "Amit",
      lastName: "Patel",
      phone: "+91 98765 44332",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 3. Create Organizations
  const techCorp = await prisma.organization.create({
    data: {
      name: "TechCorp India Solutions Pvt Ltd",
      slug: "techcorp",
      industry: "Software & Technology",
      companySize: "50-200",
      country: "India",
      state: "Karnataka",
      currency: "INR",
      currencySymbol: "₹",
      timezone: "Asia/Kolkata",
      dateFormat: "DD/MM/YYYY",
      gstin: "29AAAAA0000A1Z5",
      pan: "AAAAA0000A",
      website: "https://techcorp.in",
      phone: "+91 80 4000 1234",
      address: "Tower 4, Embassy Tech Village, Outer Ring Road, Bengaluru, Karnataka 560103",
    },
  });

  const jaipurRetail = await prisma.organization.create({
    data: {
      name: "Jaipur Handlooms & Artisans Co.",
      slug: "jaipur-retail",
      industry: "Retail & E-commerce",
      companySize: "10-50",
      country: "India",
      state: "Rajasthan",
      currency: "INR",
      currencySymbol: "₹",
      timezone: "Asia/Kolkata",
      gstin: "08BBBBB1111B2Z8",
      phone: "+91 141 223344",
      address: "MI Road, Pink City, Jaipur, Rajasthan 302001",
    },
  });

  // 4. Create Branches for TechCorp
  const hqBranch = await prisma.branch.create({
    data: {
      organizationId: techCorp.id,
      name: "Bengaluru HQ (Outer Ring Road)",
      code: "BLR-HQ",
      isMain: true,
      address: "Embassy Tech Village, Bengaluru",
      phone: "+91 80 4000 1234",
      email: "blr@techcorp.in",
    },
  });

  const mumBranch = await prisma.branch.create({
    data: {
      organizationId: techCorp.id,
      name: "Mumbai Regional Center (BKC)",
      code: "MUM-BKC",
      isMain: false,
      address: "Maker Maxity, BKC, Bandra East, Mumbai",
      phone: "+91 22 6000 5678",
      email: "mum@techcorp.in",
    },
  });

  const delBranch = await prisma.branch.create({
    data: {
      organizationId: techCorp.id,
      name: "Delhi NCR Innovation Hub (Gurugram)",
      code: "DEL-GGM",
      isMain: false,
      address: "Cyber City, DLF Phase 2, Gurugram",
      phone: "+91 124 400 9988",
      email: "delhi@techcorp.in",
    },
  });

  // 5. Create Roles & Permissions
  const adminRole = await prisma.role.create({
    data: {
      organizationId: techCorp.id,
      name: "Administrator",
      description: "Full administrative access across all apps and settings",
      isSystem: true,
    },
  });

  const salesManagerRole = await prisma.role.create({
    data: {
      organizationId: techCorp.id,
      name: "Sales Manager",
      description: "Manage CRM pipelines, quotations, customers and sales reports",
      isSystem: true,
    },
  });

  const financeManagerRole = await prisma.role.create({
    data: {
      organizationId: techCorp.id,
      name: "Finance Manager",
      description: "Create and post invoices, track payments, generate GST reports",
      isSystem: true,
    },
  });

  const projectLeadRole = await prisma.role.create({
    data: {
      organizationId: techCorp.id,
      name: "Project Lead",
      description: "Manage projects, assign tasks, review milestones and log timesheets",
      isSystem: true,
    },
  });

  // Assign Permissions
  const modules = ["crm", "sales", "invoices", "products", "projects", "contacts", "settings", "automation"];
  for (const mod of modules) {
    await prisma.permission.create({
      data: {
        roleId: adminRole.id,
        module: mod,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canExport: true,
        canImport: true,
        canApprove: true,
        canConfigure: true,
      },
    });

    await prisma.permission.create({
      data: {
        roleId: salesManagerRole.id,
        module: mod,
        canView: true,
        canCreate: ["crm", "sales", "contacts"].includes(mod),
        canEdit: ["crm", "sales", "contacts"].includes(mod),
        canDelete: false,
        canExport: true,
        canImport: ["crm", "contacts"].includes(mod),
        canApprove: ["sales"].includes(mod),
        canConfigure: false,
      },
    });
  }

  // Link Organization Users
  await prisma.organizationUser.create({
    data: {
      organizationId: techCorp.id,
      userId: prithibi.id,
      roleId: adminRole.id,
      defaultBranchId: hqBranch.id,
      status: "active",
      joinedAt: new Date(),
    },
  });

  await prisma.organizationUser.create({
    data: {
      organizationId: techCorp.id,
      userId: rahul.id,
      roleId: salesManagerRole.id,
      defaultBranchId: mumBranch.id,
      status: "active",
      joinedAt: new Date(),
    },
  });

  await prisma.organizationUser.create({
    data: {
      organizationId: techCorp.id,
      userId: priya.id,
      roleId: financeManagerRole.id,
      defaultBranchId: hqBranch.id,
      status: "active",
      joinedAt: new Date(),
    },
  });

  await prisma.organizationUser.create({
    data: {
      organizationId: techCorp.id,
      userId: amit.id,
      roleId: projectLeadRole.id,
      defaultBranchId: delBranch.id,
      status: "active",
      joinedAt: new Date(),
    },
  });

  // 6. Installed Apps
  const defaultApps = [
    { appKey: "crm", isInstalled: true },
    { appKey: "sales", isInstalled: true },
    { appKey: "invoices", isInstalled: true },
    { appKey: "products", isInstalled: true },
    { appKey: "projects", isInstalled: true },
    { appKey: "contacts", isInstalled: true },
    { appKey: "automations", isInstalled: true },
    { appKey: "inventory", isInstalled: false },
    { appKey: "helpdesk", isInstalled: false },
  ];

  for (const app of defaultApps) {
    await prisma.organizationApp.create({
      data: {
        organizationId: techCorp.id,
        appKey: app.appKey,
        isInstalled: app.isInstalled,
      },
    });
  }

  // 7. CRM Pipeline Stages
  const stageNew = await prisma.cRMStage.create({
    data: {
      organizationId: techCorp.id,
      name: "New",
      sequence: 1,
      probability: 10,
      color: "#6366f1", // indigo
    },
  });

  const stageQualified = await prisma.cRMStage.create({
    data: {
      organizationId: techCorp.id,
      name: "Qualified",
      sequence: 2,
      probability: 35,
      color: "#3b82f6", // blue
    },
  });

  const stageProposal = await prisma.cRMStage.create({
    data: {
      organizationId: techCorp.id,
      name: "Proposal Sent",
      sequence: 3,
      probability: 60,
      color: "#f59e0b", // amber
    },
  });

  const stageNegotiation = await prisma.cRMStage.create({
    data: {
      organizationId: techCorp.id,
      name: "Negotiation",
      sequence: 4,
      probability: 80,
      color: "#8b5cf6", // purple
    },
  });

  const stageWon = await prisma.cRMStage.create({
    data: {
      organizationId: techCorp.id,
      name: "Won",
      sequence: 5,
      probability: 100,
      isWon: true,
      color: "#10b981", // emerald
    },
  });

  const stageLost = await prisma.cRMStage.create({
    data: {
      organizationId: techCorp.id,
      name: "Lost",
      sequence: 6,
      probability: 0,
      isLost: true,
      color: "#ef4444", // rose
    },
  });

  // 8. Contacts (Customers & Partners)
  const contactReliance = await prisma.contact.create({
    data: {
      organizationId: techCorp.id,
      branchId: mumBranch.id,
      type: "company",
      name: "Reliance Digital Enterprises",
      companyName: "Reliance Retail Ltd",
      email: "procurement@relianceretail.com",
      phone: "+91 22 3555 1000",
      mobile: "+91 98200 12345",
      isCustomer: true,
      gstin: "27AAACR1234A1ZP",
      pan: "AAACR1234A",
      website: "https://relianceretail.com",
      street: "Reliance Corporate Park, Thane-Belapur Road",
      city: "Navi Mumbai",
      state: "Maharashtra",
      postalCode: "400701",
      country: "India",
      creditLimit: 5000000,
      tags: "Enterprise, Key Account, Retail",
      ownerId: rahul.id,
    },
  });

  const contactZomato = await prisma.contact.create({
    data: {
      organizationId: techCorp.id,
      branchId: delBranch.id,
      type: "company",
      name: "Zomato Media Pvt Ltd",
      companyName: "Zomato Group",
      email: "tech-vendor@zomato.com",
      phone: "+91 124 415 6600",
      isCustomer: true,
      gstin: "06AABCI9988C1Z3",
      website: "https://zomato.com",
      street: "Pioneer Square, Sector 62",
      city: "Gurugram",
      state: "Haryana",
      postalCode: "122098",
      country: "India",
      creditLimit: 2500000,
      tags: "Tech, FoodTech, Unicorn",
      ownerId: prithibi.id,
    },
  });

  const contactRazorpay = await prisma.contact.create({
    data: {
      organizationId: techCorp.id,
      branchId: hqBranch.id,
      type: "company",
      name: "Razorpay Software Pvt Ltd",
      companyName: "Razorpay India",
      email: "partnerships@razorpay.com",
      phone: "+91 80 4666 9900",
      isCustomer: true,
      gstin: "29AABCR8765D1Z9",
      website: "https://razorpay.com",
      street: "SJR Cyber, Hosur Road, Adugodi",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560030",
      country: "India",
      creditLimit: 3000000,
      tags: "FinTech, Strategic Partner",
      ownerId: rahul.id,
    },
  });

  const contactSwiggy = await prisma.contact.create({
    data: {
      organizationId: techCorp.id,
      branchId: hqBranch.id,
      type: "company",
      name: "Bundl Technologies (Swiggy)",
      companyName: "Swiggy Ltd",
      email: "enterprise-it@swiggy.in",
      phone: "+91 80 6745 2200",
      isCustomer: true,
      gstin: "29AACCB4455E1ZX",
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      tags: "Enterprise, Logistics",
    },
  });

  // 9. Product Master & Categories
  const catSoftware = await prisma.productCategory.create({
    data: {
      organizationId: techCorp.id,
      name: "Cloud Software & Licenses",
    },
  });

  const catServices = await prisma.productCategory.create({
    data: {
      organizationId: techCorp.id,
      name: "Professional Consulting & Development",
    },
  });

  const prodERP = await prisma.product.create({
    data: {
      organizationId: techCorp.id,
      name: "BusinessOS Enterprise Core (Annual License)",
      sku: "BOS-ENT-ANNUAL",
      barcode: "8901234567890",
      categoryId: catSoftware.id,
      productType: "service",
      sellingPrice: 180000,
      costPrice: 40000,
      taxRate: 18.0,
      hsnCode: "997331",
      stockOnHand: 999,
      uom: "Year",
      description: "Full enterprise license including unlimited users, multi-branch, CRM, Invoicing, and Custom Fields",
    },
  });

  const prodHosting = await prisma.product.create({
    data: {
      organizationId: techCorp.id,
      name: "Dedicated High-Availability Cloud Cluster",
      sku: "BOS-CLOUD-HA",
      categoryId: catSoftware.id,
      productType: "service",
      sellingPrice: 65000,
      costPrice: 22000,
      taxRate: 18.0,
      hsnCode: "998315",
      stockOnHand: 100,
      uom: "Month",
      description: "Dedicated PostgreSQL and Redis cluster with 99.99% uptime SLA and real-time replicas",
    },
  });

  const prodConsulting = await prisma.product.create({
    data: {
      organizationId: techCorp.id,
      name: "Custom ERP Implementation & Training (Pack)",
      sku: "BOS-IMP-PACK-50",
      categoryId: catServices.id,
      productType: "service",
      sellingPrice: 125000,
      costPrice: 50000,
      taxRate: 18.0,
      hsnCode: "998314",
      stockOnHand: 50,
      uom: "Package",
      description: "50 hours of tailored onboarding, legacy data migration, and department training",
    },
  });

  const prodCustomDev = await prisma.product.create({
    data: {
      organizationId: techCorp.id,
      name: "Senior Software Engineer Custom Dev Hours",
      sku: "DEV-SR-HOURLY",
      categoryId: catServices.id,
      productType: "service",
      sellingPrice: 2800,
      costPrice: 1200,
      taxRate: 18.0,
      hsnCode: "998314",
      stockOnHand: 500,
      uom: "Hours",
      description: "Bespoke module development, API integrations, and workflow customizations",
    },
  });

  // 10. CRM Leads & Opportunities
  const lead1 = await prisma.lead.create({
    data: {
      organizationId: techCorp.id,
      branchId: mumBranch.id,
      name: "Reliance Omnichannel ERP Rollout",
      companyName: "Reliance Retail Ltd",
      contactName: "Vikram Malhotra",
      email: "v.malhotra@relianceretail.com",
      phone: "+91 98200 44556",
      source: "Referral",
      priority: "Urgent",
      expectedRevenue: 1250000,
      probability: 80,
      stageId: stageNegotiation.id,
      assignedToId: rahul.id,
      tags: "Enterprise, Multi-Branch, Priority",
      notes: "Final contract negotiation with IT Security & Procurement team.",
      expectedClosing: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      organizationId: techCorp.id,
      branchId: delBranch.id,
      name: "Zomato Partner Portal & Billing Engine",
      companyName: "Zomato Media Pvt Ltd",
      contactName: "Ananya Deshmukh",
      email: "ananya.d@zomato.com",
      phone: "+91 98111 22334",
      source: "Website",
      priority: "High",
      expectedRevenue: 850000,
      probability: 60,
      stageId: stageProposal.id,
      assignedToId: prithibi.id,
      tags: "Custom Billing, API Integration",
      notes: "Proposal submitted for 500 enterprise seats and custom webhook pipelines.",
      expectedClosing: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
  });

  const lead3 = await prisma.lead.create({
    data: {
      organizationId: techCorp.id,
      branchId: hqBranch.id,
      name: "Razorpay Merchant Analytics Dashboard",
      companyName: "Razorpay Software Pvt Ltd",
      contactName: "Harshil K",
      email: "harshil.k@razorpay.com",
      source: "LinkedIn",
      priority: "High",
      expectedRevenue: 620000,
      probability: 100,
      stageId: stageWon.id,
      assignedToId: rahul.id,
      tags: "Won, Q3 Closed",
      notes: "Won deal! Moving to project kickoff and billing.",
    },
  });

  const lead4 = await prisma.lead.create({
    data: {
      organizationId: techCorp.id,
      branchId: hqBranch.id,
      name: "Swiggy Delivery Partner Equipment Tracker",
      companyName: "Bundl Technologies (Swiggy)",
      contactName: "Rohit Verma",
      email: "rohit.verma@swiggy.in",
      source: "Cold Call",
      priority: "Medium",
      expectedRevenue: 340000,
      probability: 35,
      stageId: stageQualified.id,
      assignedToId: rahul.id,
      tags: "Inventory Tracking, IoT",
      notes: "Completed discovery call. Needs multi-warehouse batch tracking demonstration.",
    },
  });

  const lead5 = await prisma.lead.create({
    data: {
      organizationId: techCorp.id,
      branchId: mumBranch.id,
      name: "FinTech Invoicing Automation Engine",
      companyName: "PayU India",
      contactName: "Sanjay Singhal",
      email: "sanjay@payu.in",
      source: "Website",
      priority: "Low",
      expectedRevenue: 180000,
      probability: 10,
      stageId: stageNew.id,
      assignedToId: rahul.id,
      tags: "Inbound, Web Form",
    },
  });

  // 11. Quotations & Line Items
  const quote1 = await prisma.quotation.create({
    data: {
      organizationId: techCorp.id,
      branchId: mumBranch.id,
      quotationNumber: "QT-2026-0001",
      customerId: contactReliance.id,
      status: "confirmed",
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paymentTerms: "30 Days",
      subtotal: 545000,
      taxAmount: 98100,
      discountAmount: 25000,
      totalAmount: 618100,
      notes: "Special enterprise discount of ₹25,000 applied for 3-year upfront commitment.",
      termsAndConditions: "1. 50% advance upon PO signoff, 50% upon deployment.\n2. Standard 1-year warranty on custom integration code.",
      createdById: rahul.id,
    },
  });

  await prisma.quotationLine.create({
    data: {
      quotationId: quote1.id,
      productId: prodERP.id,
      description: "BusinessOS Enterprise Core (Annual License) - 3 Years",
      quantity: 2,
      unitPrice: 180000,
      taxRate: 18.0,
      taxAmount: 64800,
      lineTotal: 360000,
    },
  });

  await prisma.quotationLine.create({
    data: {
      quotationId: quote1.id,
      productId: prodConsulting.id,
      description: "Tailored Implementation & Data Migration",
      quantity: 1,
      unitPrice: 125000,
      taxRate: 18.0,
      taxAmount: 22500,
      lineTotal: 125000,
    },
  });

  await prisma.quotationLine.create({
    data: {
      quotationId: quote1.id,
      productId: prodHosting.id,
      description: "Dedicated High-Availability Cloud Cluster (Year 1)",
      quantity: 1,
      unitPrice: 60000,
      taxRate: 18.0,
      taxAmount: 10800,
      lineTotal: 60000,
    },
  });

  const quote2 = await prisma.quotation.create({
    data: {
      organizationId: techCorp.id,
      branchId: hqBranch.id,
      quotationNumber: "QT-2026-0002",
      customerId: contactRazorpay.id,
      status: "approved",
      issueDate: new Date(),
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      paymentTerms: "Immediate",
      subtotal: 305000,
      taxAmount: 54900,
      totalAmount: 359900,
      createdById: prithibi.id,
    },
  });

  await prisma.quotationLine.create({
    data: {
      quotationId: quote2.id,
      productId: prodERP.id,
      description: "BusinessOS Enterprise License - 1 Year",
      quantity: 1,
      unitPrice: 180000,
      taxRate: 18.0,
      taxAmount: 32400,
      lineTotal: 180000,
    },
  });

  await prisma.quotationLine.create({
    data: {
      quotationId: quote2.id,
      productId: prodConsulting.id,
      description: "Onboarding & Custom Workflow Automation",
      quantity: 1,
      unitPrice: 125000,
      taxRate: 18.0,
      taxAmount: 22500,
      lineTotal: 125000,
    },
  });

  // 12. Invoices & Payments
  const invoice1 = await prisma.invoice.create({
    data: {
      organizationId: techCorp.id,
      branchId: mumBranch.id,
      invoiceNumber: "INV-2026-0101",
      customerId: contactReliance.id,
      quotationId: quote1.id,
      status: "posted",
      issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      paymentTerms: "30 Days",
      subtotal: 520000,
      taxAmount: 93600,
      cgstAmount: 46800,
      sgstAmount: 46800,
      igstAmount: 0,
      discountAmount: 0,
      totalAmount: 613600,
      amountPaid: 300000,
      amountDue: 313600,
      notes: "Invoice generated from Quotation QT-2026-0001. First milestone advance received.",
      createdById: priya.id,
    },
  });

  await prisma.invoiceLine.create({
    data: {
      invoiceId: invoice1.id,
      productId: prodERP.id,
      description: "BusinessOS Enterprise Core (Annual License)",
      hsnCode: "997331",
      quantity: 2,
      unitPrice: 180000,
      taxRate: 18.0,
      taxAmount: 64800,
      lineTotal: 360000,
    },
  });

  await prisma.invoiceLine.create({
    data: {
      invoiceId: invoice1.id,
      productId: prodConsulting.id,
      description: "Implementation & Training Pack",
      hsnCode: "998314",
      quantity: 1,
      unitPrice: 125000,
      taxRate: 18.0,
      taxAmount: 22500,
      lineTotal: 125000,
    },
  });

  // Add partial payment
  await prisma.payment.create({
    data: {
      organizationId: techCorp.id,
      invoiceId: invoice1.id,
      customerId: contactReliance.id,
      paymentNumber: "PAY-2026-0088",
      amount: 300000,
      paymentMethod: "Bank Transfer",
      referenceNumber: "NEFT-HDFC-9988221",
      paymentDate: new Date(),
      notes: "50% project advance transferred via NEFT.",
      createdById: priya.id,
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      organizationId: techCorp.id,
      branchId: hqBranch.id,
      invoiceNumber: "INV-2026-0102",
      customerId: contactRazorpay.id,
      status: "paid",
      issueDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      paymentTerms: "Immediate",
      subtotal: 305000,
      taxAmount: 54900,
      cgstAmount: 27450,
      sgstAmount: 27450,
      totalAmount: 359900,
      amountPaid: 359900,
      amountDue: 0,
      notes: "Full payment settled via Razorpay Auto-Debit.",
      createdById: priya.id,
    },
  });

  await prisma.invoiceLine.create({
    data: {
      invoiceId: invoice2.id,
      productId: prodERP.id,
      description: "BusinessOS Enterprise License - 1 Year",
      hsnCode: "997331",
      quantity: 1,
      unitPrice: 180000,
      taxRate: 18.0,
      taxAmount: 32400,
      lineTotal: 180000,
    },
  });

  await prisma.payment.create({
    data: {
      organizationId: techCorp.id,
      invoiceId: invoice2.id,
      customerId: contactRazorpay.id,
      paymentNumber: "PAY-2026-0089",
      amount: 359900,
      paymentMethod: "UPI",
      referenceNumber: "UPI-RAZORPAY-4411",
      paymentDate: new Date(),
      notes: "Settled in full.",
      createdById: priya.id,
    },
  });

  // Overdue Invoice
  const invoice3 = await prisma.invoice.create({
    data: {
      organizationId: techCorp.id,
      branchId: delBranch.id,
      invoiceNumber: "INV-2026-0095",
      customerId: contactZomato.id,
      status: "overdue",
      issueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      paymentTerms: "30 Days",
      subtotal: 210000,
      taxAmount: 37800,
      igstAmount: 37800,
      totalAmount: 247800,
      amountPaid: 0,
      amountDue: 247800,
      notes: "Past due date. Follow up reminder sent.",
      createdById: priya.id,
    },
  });

  // 13. Projects & Tasks
  const proj1 = await prisma.project.create({
    data: {
      organizationId: techCorp.id,
      branchId: mumBranch.id,
      name: "Reliance Retail ERP Deployment",
      code: "PRJ-REL-01",
      description: "Implementation of multi-store POS sync and GST auto-invoicing module.",
      customerId: contactReliance.id,
      managerId: amit.id,
      status: "active",
      startDate: new Date(),
      targetEndDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      budget: 650000,
    },
  });

  const stageBacklog = await prisma.projectStage.create({
    data: { projectId: proj1.id, name: "Backlog", sequence: 1, color: "#64748b" },
  });
  const stageInProgress = await prisma.projectStage.create({
    data: { projectId: proj1.id, name: "In Progress", sequence: 2, color: "#3b82f6" },
  });
  const stageReview = await prisma.projectStage.create({
    data: { projectId: proj1.id, name: "In Review", sequence: 3, color: "#f59e0b" },
  });
  const stageDone = await prisma.projectStage.create({
    data: { projectId: proj1.id, name: "Done", sequence: 4, color: "#10b981" },
  });

  await prisma.task.create({
    data: {
      organizationId: techCorp.id,
      projectId: proj1.id,
      stageId: stageInProgress.id,
      title: "Configure GST Tax Rates & HSN Codes for Retail SKUs",
      description: "Set up 0%, 5%, 12%, 18%, 28% tax buckets with automatic CGST/SGST splitting.",
      priority: "Urgent",
      status: "in_progress",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      estimatedHours: 16,
      actualHours: 8,
      assignedToId: amit.id,
      createdById: prithibi.id,
      tags: "Tax, Finance, Backend",
    },
  });

  await prisma.task.create({
    data: {
      organizationId: techCorp.id,
      projectId: proj1.id,
      stageId: stageReview.id,
      title: "Design Custom Quotation PDF Template with Company Header",
      description: "Modern layout with logo, GSTIN, authorized signatory box, and QR code for UPI payment.",
      priority: "High",
      status: "review",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      estimatedHours: 12,
      actualHours: 11,
      assignedToId: rahul.id,
      createdById: amit.id,
      tags: "UI/UX, PDF, Sales",
    },
  });

  await prisma.task.create({
    data: {
      organizationId: techCorp.id,
      projectId: proj1.id,
      stageId: stageDone.id,
      title: "Legacy Customer Data Import & Scrubbing",
      description: "Imported 1,420 historical customer contacts from CSV with verified GSTIN numbers.",
      priority: "Medium",
      status: "done",
      estimatedHours: 20,
      actualHours: 18,
      assignedToId: amit.id,
      createdById: amit.id,
      tags: "Migration, Database",
    },
  });

  // 14. Universal Chatter, Activities & Audit Logs
  // Chatter for Lead 1
  await prisma.comment.create({
    data: {
      organizationId: techCorp.id,
      recordType: "lead",
      recordId: lead1.id,
      content: "Customer requested revised quotation including 3 years of SLA maintenance. Updated expected revenue to ₹12.5L.",
      authorId: rahul.id,
    },
  });

  await prisma.comment.create({
    data: {
      organizationId: techCorp.id,
      recordType: "lead",
      recordId: lead1.id,
      content: "@Prithibi Please approve the 4% special volume discount so we can lock in the contract by Friday.",
      authorId: rahul.id,
    },
  });

  await prisma.activity.create({
    data: {
      organizationId: techCorp.id,
      recordType: "lead",
      recordId: lead1.id,
      activityType: "meeting",
      summary: "Executive Contract Signoff Meeting with VP Procurement",
      notes: "Review final terms and payment schedule.",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      assignedToId: rahul.id,
      createdById: rahul.id,
    },
  });

  await prisma.activity.create({
    data: {
      organizationId: techCorp.id,
      recordType: "invoice",
      recordId: invoice3.id,
      activityType: "call",
      summary: "Payment follow-up call with Accounts Payable",
      notes: "Invoice INV-2026-0095 is 15 days overdue.",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      assignedToId: priya.id,
      createdById: priya.id,
    },
  });

  // Audit Logs
  await prisma.auditLog.create({
    data: {
      organizationId: techCorp.id,
      recordType: "lead",
      recordId: lead1.id,
      action: "stage_change",
      fieldName: "stage",
      oldValue: "Proposal Sent",
      newValue: "Negotiation",
      userId: rahul.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: techCorp.id,
      recordType: "quotation",
      recordId: quote1.id,
      action: "status_change",
      fieldName: "status",
      oldValue: "sent",
      newValue: "confirmed",
      userId: rahul.id,
    },
  });

  // 15. Custom Fields
  await prisma.customField.create({
    data: {
      organizationId: techCorp.id,
      modelName: "lead",
      name: "customer_budget_range",
      label: "Customer Annual IT Budget",
      fieldType: "select",
      optionsJson: JSON.stringify(["Under ₹5 Lakhs", "₹5L - ₹25 Lakhs", "₹25L - ₹1 Crore", "₹1 Crore+"]),
      position: 1,
    },
  });

  await prisma.customField.create({
    data: {
      organizationId: techCorp.id,
      modelName: "contact",
      name: "preferred_communication_channel",
      label: "Preferred Contact Method",
      fieldType: "select",
      optionsJson: JSON.stringify(["WhatsApp", "Email", "Phone", "In-Person"]),
      position: 1,
    },
  });

  // 16. Automation Rules
  await prisma.automationRule.create({
    data: {
      organizationId: techCorp.id,
      name: "High Value Lead Notification (> ₹5,00,000)",
      modelName: "lead",
      triggerType: "record_created",
      conditionsJson: JSON.stringify({
        operator: "AND",
        conditions: [{ field: "expectedRevenue", operator: "gte", value: 500000 }],
      }),
      actionsJson: JSON.stringify([
        { type: "add_tag", params: { tag: "High Value VIP" } },
        { type: "send_notification", params: { message: "High value opportunity created!" } },
      ]),
      isActive: true,
    },
  });

  console.log("✅ Seed completed successfully!");
}

if (require.main === module) {
  seedDatabase()
    .catch((e) => {
      console.error("❌ Seed error:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
