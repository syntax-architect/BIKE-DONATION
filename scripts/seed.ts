/**
 * Seed script — The People's Apache RR310
 * Generates a realistic contributor ledger that sums EXACTLY to ₹1,48,200
 * (37.05% of the ₹4,00,000 target).
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Deterministic RNG so re-seeding is stable
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20251111);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

const FIRST = [
  "Aarav", "Ananya", "Ankit", "Arjun", "Avani", "Bhavya", "Dev", "Dhruv", "Diya", "Esha",
  "Gaurav", "Ishaan", "Kabir", "Kavya", "Krish", "Meera", "Nisha", "Parth", "Priya", "Rahul",
  "Raj", "Riya", "Rohan", "Sanjana", "Shreya", "Siddharth", "Tanvi", "Uday", "Varun", "Vihaan",
  "Viraj", "Yash", "Zoya", "Advait", "Nikhil", "Pooja", "Karan", "Aditi", "Manav", "Sanya",
  "Harsh", "Isha", "Neel", "Tara", "Om", "Jiya", "Aryan", "Myra", "Atharv", "Rehan",
];
const LAST = [
  "Sharma", "Verma", "Iyer", "Patel", "Reddy", "Nair", "Mehta", "Singh", "Gupta", "Rao",
  "Joshi", "Das", "Kulkarni", "Bhat", "Menon", "Chatterjee", "Malhotra", "Kapoor", "Shah", "Pillai",
];
const MSGS = [
  "WHEELIE OR DIE", "BORN TO RIDE", "REDLINE DAILY", "APEX PREDATOR", "GEAR UP INDIA",
  "SPEED IS LIFE", "TRACK RAT 001", "FULL SEND FAM", "MOTO SOUL", "CHAIN REACTION",
  "GRID LOCKED", "TORQUE TALK", "BURN RUBBER", "LAP GOD", "CLOUD 9 RIDER", "PAVED MY WAY",
];

function personName() {
  const f = pick(FIRST);
  const l = pick(LAST);
  return `${f} ${l.charAt(0)}.`;
}
function handleFor(name: string) {
  const base = name.split(" ")[0].toLowerCase();
  const r = rand();
  if (r < 0.5) return `@${base}.${pick(["rides", "moto", "310", "laps", "redline", "revs"])}`;
  if (r < 0.8) return `@${base}_${Math.floor(rand() * 900 + 100)}`;
  return `@${base}`;
}

type Row = {
  name: string; handle: string | null; zone: string; amount: number; txId: string; createdAt: Date;
};

function makeRow(zone: string, amount: number, name?: string, handle?: string, msg?: string): Row {
  const n = name ?? personName();
  const h = handle ?? (rand() < 0.72 ? handleFor(n) : null);
  return {
    name: n.slice(0, 25),
    handle: (msg ?? h ?? null)?.slice(0, 15) || null,
    zone,
    amount,
    txId: `SEED${Math.floor(rand() * 1e9).toString().padStart(12, "7").slice(0, 12)}${Math.floor(rand() * 1e5)}`.slice(0, 16),
    createdAt: new Date(Date.now() - Math.floor(rand() * 9 * 24 * 3600 * 1000) - Math.floor(rand() * 3600 * 1000)),
  };
}

async function main() {
  await db.contribution.deleteMany({});
  const rows: Row[] = [];

  // ---- VIP Rear Aerocowl (7 contributors, ₹14,200) ----
  const sponsors: Array<[string, string, string | null]> = [
    ["Dev 'Redline' Rathore", "@redline.dev", "TITLE SPONSOR"],
    ["Meera Kulkarni", "@meera.rides", "APEX ENERGY"],
    ["Team Vandex Racing", "@vandexracing", "GO FAST OR GO"],
    ["Arjun Mehta", "@arjun.moto", "WINGLET KING"],
    ["Sanya Kapoor", "@sanyak", "RR310 FOREVER"],
    ["Kabir Shah", "@kabir.shah", null],
    ["Zoya Das", "@zoyadas", null],
  ];
  const sponsorAmounts = [5000, 2500, 2000, 1500, 1200, 1000, 1000];
  sponsors.forEach(([n, h, m], i) => rows.push(makeRow("COWL", sponsorAmounts[i], n, h, m ?? undefined)));

  // ---- Winglets: 22 × ₹500 = ₹11,000 ----
  for (let i = 0; i < 22; i++) rows.push(makeRow("WINGLETS", 500));

  // ---- Fuel Tank: 310 × ₹100 = ₹31,000 ----
  for (let i = 0; i < 310; i++) rows.push(makeRow("TANK", 100));

  // ---- Side Fairing: 850 × ₹50 = ₹42,500 ----
  for (let i = 0; i < 850; i++) rows.push(makeRow("FAIRING", 50));

  // ---- Belly Pan: 4,873 × ₹10 = ₹48,730 ----
  // (offsets the 6 fresh ticker rows below, ₹770, so the grand total is exactly ₹1,48,200)
  for (let i = 0; i < 4873; i++) rows.push(makeRow("BELLY", 10));

  // Fresh activity for the ticker: push a handful into the last ~90 minutes
  const freshNames: Array<[string, string, string, number]> = [
    ["Ankit R.", "@ankit.revz", "TANK", 100],
    ["Priya Nair", "@priya.rides", "WINGLETS", 500],
    ["Dev P.", "@devp_310", "BELLY", 10],
    ["Sanjana G.", "@sanju.moto", "FAIRING", 50],
    ["Rohan V.", "@rohanverma", "BELLY", 10],
    ["Ishaan K.", "@ishaan.laps", "TANK", 100],
  ];
  freshNames.forEach(([n, h, z, a], i) => {
    const row = makeRow(z, a, n, h);
    row.createdAt = new Date(Date.now() - (i + 1) * 11 * 60 * 1000);
    rows.push(row);
  });

  // Make sponsors the most recent VIP activity too (they sit on top of Hall of Fame)
  rows[0].createdAt = new Date(Date.now() - 42 * 60 * 1000);
  rows[1].createdAt = new Date(Date.now() - 75 * 60 * 1000);

  const total = rows.reduce((s, r) => s + r.amount, 0);
  console.log(`Seeding ${rows.length} contributions — total ₹${total.toLocaleString("en-IN")}`);
  if (total !== 148200) throw new Error(`Total mismatch: ${total} != 148200`);

  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    await db.contribution.createMany({ data: rows.slice(i, i + CHUNK) });
  }
  const agg = await db.contribution.aggregate({ _sum: { amount: true }, _count: true });
  console.log(`DB check — rows: ${agg._count}, sum: ₹${agg._sum.amount?.toLocaleString("en-IN")}`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
