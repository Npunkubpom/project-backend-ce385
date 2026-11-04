// src/lib/prisma.ts — จุดเดียวในโปรแกรมที่สร้าง PrismaClient (เหมือนสไลด์สัปดาห์ที่ 8)
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("ไม่พบค่า DATABASE_URL — คัดลอก .env.example เป็น .env แล้วกรอกให้ครบก่อน");
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
