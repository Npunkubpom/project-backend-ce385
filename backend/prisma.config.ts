// prisma.config.ts — ไฟล์ตั้งค่าของเครื่องมือ Prisma (แบบเดียวกับสไลด์สัปดาห์ที่ 8)
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
