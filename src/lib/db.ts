import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

function resolveDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw || !raw.startsWith("file:")) return raw;
  const filePart = raw.slice("file:".length);
  if (path.isAbsolute(filePart)) return raw;

  const candidates = [
    path.resolve(process.cwd(), "db/custom.db"),
    path.resolve(process.cwd(), "../db/custom.db"),
    path.resolve(process.cwd(), "../../db/custom.db"),
    path.resolve(process.cwd(), "prisma", filePart),
  ];
  const found = candidates.find((p) => fs.existsSync(p));
  return found ? `file:${found.replace(/\\/g, "/")}` : raw;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const resolvedUrl = resolveDatabaseUrl();

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    ...(resolvedUrl ? { datasources: { db: { url: resolvedUrl } } } : {}),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
