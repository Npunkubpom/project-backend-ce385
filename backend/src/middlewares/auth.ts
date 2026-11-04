// src/middlewares/auth.ts — ด่านตรวจสิทธิ์ (middleware อีก 2 ตัว ต่อจากสัปดาห์ที่ 5)
//   authenticate  = "คุณคือใคร"      ไม่มี/บัตรปลอม/หมดอายุ → 401
//   authorize     = "คุณทำสิ่งนี้ได้ไหม" บทบาทไม่ตรง        → 403
import type { RequestHandler } from "express";
import { forbidden, unauthorized } from "../errors/app-error.js";
import { verifyToken, type TokenPayload } from "../lib/jwt.js";

export const authenticate: RequestHandler = (req, res, next) => {
  // header รูปแบบ: Authorization: Bearer <token>
  const header = req.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    next(unauthorized("กรุณาเข้าสู่ระบบก่อน"));
    return;
  }

  const user = verifyToken(token);
  if (!user) {
    next(unauthorized("เซสชันหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่"));
    return;
  }

  res.locals.user = user; // ข้อมูลของคำขอนี้ อยู่กับคำขอนี้เท่านั้น
  next();
};

export function authorize(...roles: TokenPayload["role"][]): RequestHandler {
  return (_req, res, next) => {
    const user = res.locals.user as TokenPayload;
    if (!roles.includes(user.role)) {
      next(forbidden("คุณไม่มีสิทธิ์ใช้งานส่วนนี้"));
      return;
    }
    next();
  };
}
