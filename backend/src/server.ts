// src/server.ts — จุดเริ่มโปรแกรม หน้าที่เดียว: เปิดพอร์ต
import "dotenv/config";
import { app } from "./app.js";
import { prisma } from "./lib/prisma.js";

const PORT = Number(process.env.PORT ?? 3000);

const server = app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์พร้อมรับคำขอที่ http://localhost:${PORT}`);
  console.log(`ลองยิงดู: curl http://localhost:${PORT}/api/v1/services`);
});

// กด Ctrl+C แล้วคืน connection ให้ฐานข้อมูลก่อนปิด
const shutdown = async () => {
  console.log("\nกำลังปิดเซิร์ฟเวอร์...");
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
