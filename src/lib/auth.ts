import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prisma from "./prisma";
import { UserSecurityContext, PermissionDefinition, AppModuleName, RecordScope } from "@/core/security/permission-engine";

const JWT_SECRET = process.env.JWT_SECRET || "business-os-secret-key-development-2026";
const AUTH_COOKIE_NAME = "business_os_token";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  return user;
}

export async function getSecurityContext(orgId?: string | null): Promise<UserSecurityContext | null> {
  let user = await getCurrentUser();
  if (!user) {
    user = await prisma.user.findFirst({ orderBy: { createdAt: "desc" } });
  }

  if (!user) return null;

  const orgUser = await prisma.organizationUser.findFirst({
    where: {
      userId: user.id,
      ...(orgId ? { organizationId: orgId } : {}),
    },
    include: {
      organization: true,
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!orgUser) return null;

  const permissions: PermissionDefinition[] = (orgUser.role.permissions || []).map((p) => ({
    module: p.module as AppModuleName,
    canView: p.canView,
    canCreate: p.canCreate,
    canEdit: p.canEdit,
    canDelete: p.canDelete,
    canApprove: p.canApprove,
    canAssign: p.canAssign,
    canShare: p.canShare,
    canExport: p.canExport,
    canImport: p.canImport,
    canConfigure: p.canConfigure,
    recordScope: (p.recordScope as RecordScope) || "own",
    maxApprovalAmount: p.maxApprovalAmount,
    fieldRestrictions: p.fieldRestrictionsJson ? JSON.parse(p.fieldRestrictionsJson) : undefined,
  }));

  return {
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isSuperAdmin: user.isSuperAdmin,
    organizationId: orgUser.organizationId,
    branchId: orgUser.defaultBranchId,
    department: orgUser.department,
    team: orgUser.team,
    portalType: orgUser.portalType as any,
    portalContactId: orgUser.portalContactId,
    role: {
      id: orgUser.role.id,
      name: orgUser.role.name,
      description: orgUser.role.description,
      isSystem: orgUser.role.isSystem,
    },
    permissions,
  };
}

export { AUTH_COOKIE_NAME };
