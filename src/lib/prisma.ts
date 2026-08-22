import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function setupDatabaseUrl() {
  const isVercel = Boolean(process.env.VERCEL || process.env.AWS_REGION);

  if (isVercel) {
    const tmpDbPath = "/tmp/dev.db";
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.join(process.cwd(), "prisma", "template.db"),
        path.join(process.cwd(), "prisma", "dev.db"),
        path.join(process.cwd(), "dev.db"),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            break;
          } catch (e) {
            console.error("Failed to copy template.db to /tmp:", e);
          }
        }
      }
    }
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  } else if (!process.env.DATABASE_URL || process.env.DATABASE_URL === "file:./dev.db") {
    // Local dev fallback
    const prismaDevDb = path.join(process.cwd(), "prisma", "dev.db");
    if (fs.existsSync(prismaDevDb)) {
      process.env.DATABASE_URL = `file:${prismaDevDb}`;
    }
  }
}

setupDatabaseUrl();

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}

export default prisma;
