// src/middlewares/error-handler.ts — ตัวดักข้อผิดพลาดรวมศูนย์ (แบบสไลด์สัปดาห์ที่ 8)
// ในระบบนี้มี "ที่เดียว" ที่แปลง error เป็น HTTP response
import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../errors/app-error.js";

interface ErrorBody {
  error: { code: string; message: string; details?: unknown };
}

/* ---------- ไม่มี route ไหนรับคำขอนี้ ---------- */
export const notFoundHandler: RequestHandler = (req, res) => {
  const body: ErrorBody = {
    error: { code: "ROUTE_NOT_FOUND", message: `ไม่มีเส้นทาง ${req.method} ${req.originalUrl} ในระบบนี้` },
  };
  res.status(404).json(body);
};

/* ---------- ตัวดักหลัก (ต้องมี 4 พารามิเตอร์) ---------- */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // 1) ข้อมูลไม่ผ่าน Zod → 400 / 422
  if (err instanceof ZodError) {
    const status = (err as ZodError & { httpStatus?: number }).httpStatus ?? 422;
    const body: ErrorBody = {
      error: {
        code: "VALIDATION_ERROR",
        message: "ข้อมูลที่ส่งมาไม่ถูกต้อง",
        details: err.issues.map((issue) => ({
          field: issue.path.join(".") || "(ทั้งก้อน)",
          message: issue.message,
        })),
      },
    };
    res.status(status).json(body);
    return;
  }

  // 2) ข้อผิดพลาดที่เราโยนเอง (notFound, conflict, ...)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } } satisfies ErrorBody);
    return;
  }

  // 3) ข้อผิดพลาดจากฐานข้อมูล
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const map: Record<string, { status: number; code: string; message: string }> = {
      P2002: { status: 409, code: "DUPLICATE", message: "ข้อมูลนี้มีอยู่แล้วในระบบ" },
      P2003: { status: 409, code: "IN_USE", message: "ข้อมูลนี้ถูกใช้งานอยู่ จึงลบหรือแก้ไม่ได้" },
      P2025: { status: 404, code: "NOT_FOUND", message: "ไม่พบข้อมูลที่ต้องการแก้ไขหรือลบ" },
    };
    const hit = map[err.code];
    if (hit) {
      res.status(hit.status).json({ error: { code: hit.code, message: hit.message } } satisfies ErrorBody);
      return;
    }
  }

  // 4) express.json() อ่าน body ไม่ได้: JSON เขียนผิดรูป หรือใหญ่เกิน 10kb
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: { code: "BAD_JSON", message: "รูปแบบ JSON ไม่ถูกต้อง" } } satisfies ErrorBody);
    return;
  }
  if (err?.type === "entity.too.large") {
    res.status(413).json({ error: { code: "TOO_LARGE", message: "ข้อมูลที่ส่งมาใหญ่เกินไป" } } satisfies ErrorBody);
    return;
  }

  // 5) ที่เหลือคือ bug — ตอบ 500 แบบกลาง ๆ ไม่ส่งรายละเอียดภายใน (SQL, stack) ให้ client
  console.error("[UNHANDLED]", err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "เกิดข้อผิดพลาดภายในระบบ" } } satisfies ErrorBody);
};
