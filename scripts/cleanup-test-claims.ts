import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
const r = await db.contribution.deleteMany({ where: { name: { in: ["Curl Test", "E2E Rider"] } } });
console.log("removed:", r.count);
const agg = await db.contribution.aggregate({ _sum: { amount: true }, _count: true });
console.log("rows:", agg._count, "sum:", agg._sum.amount);
await db.$disconnect();
