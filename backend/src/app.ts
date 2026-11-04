// src/app.ts — ที่ประกอบร่าง
// ไฟล์นี้ตอบคำถามเดียว: "คำขอหนึ่งใบเดินผ่านอะไรบ้าง ตามลำดับไหน"
// (ใช้ Express 5 ซึ่งดัก error จาก async handler ให้เอง จึงไม่ต้องห่อด้วย asyncHandler)
import "dotenv/config";
import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.js";
import { logger } from "./middlewares/logger.js";
import { adminRouter } from "./routes/admin.route.js";
import { authRouter } from "./routes/auth.route.js";
import { employeesRouter } from "./routes/employees.route.js";
import { meRouter } from "./routes/me.route.js";
import { roomsRouter } from "./routes/rooms.route.js";
import { servicesRouter } from "./routes/services.route.js";

export const app = express();
app.disable("x-powered-by"); // ไม่บอกคนนอกว่าใช้ Express

/* ---------- 1) middleware ที่ทุกคำขอต้องผ่าน ---------- */
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5173" })); // อนุญาตเฉพาะหน้าเว็บของเรา
app.use(express.json({ limit: "10kb" })); // แปลง JSON · จำกัดขนาด กันคนส่งข้อมูลก้อนใหญ่มาถล่ม
app.use(logger);

/* ---------- 2) เช็กว่าเซิร์ฟเวอร์ยังมีชีวิต ---------- */
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/* ---------- 3) ทรัพยากรของเรา ---------- */
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/services", servicesRouter);
app.use("/api/v1/employees", employeesRouter);
app.use("/api/v1/rooms", roomsRouter);
app.use("/api/v1/me", meRouter);
app.use("/api/v1", adminRouter); // appointments · payments · customers · dashboard

/* ---------- 4) สองตัวนี้ต้องอยู่ท้ายสุดเสมอ ---------- */
app.use(notFoundHandler);
app.use(errorHandler);
