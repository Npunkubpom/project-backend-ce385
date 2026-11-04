// src/middlewares/validate.ts — ตัวตรวจข้อมูลรวมศูนย์ (แบบเดียวกับสไลด์สัปดาห์ที่ 8)
// route ไม่ต้องเขียน if ตรวจข้อมูลเอง — ผ่านด่านนี้แล้วข้อมูลจะอยู่ใน res.locals.valid
import type { RequestHandler } from "express";
import type { ZodError, ZodType } from "zod";

interface Schemas {
  params?: ZodType;
  query?: ZodType;
  body?: ZodType;
}

// ผิดที่ path/query = คำขอผิดรูป → 400 · ผิดที่ body = เนื้อหาใช้ไม่ได้ → 422
const STATUS_OF: Record<keyof Schemas, number> = { params: 400, query: 400, body: 422 };

export function validate(schemas: Schemas): RequestHandler {
  return (req, res, next) => {
    const valid: Record<string, unknown> = {};

    for (const source of ["params", "query", "body"] as const) {
      const schema = schemas[source];
      if (!schema) continue;

      const result = schema.safeParse(req[source]);
      if (!result.success) {
        (result.error as ZodError & { httpStatus?: number }).httpStatus = STATUS_OF[source];
        next(result.error); // ส่งต่อให้ error-handler ตอบ
        return;
      }
      valid[source] = result.data;
    }

    res.locals.valid = valid;
    next();
  };
}
