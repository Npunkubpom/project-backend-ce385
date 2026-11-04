// src/controllers/auth.controller.ts — ชั้นแปลภาษา HTTP
// หน้าที่ 3 อย่าง: หยิบข้อมูลที่ผ่านการตรวจแล้ว → เรียก service 1 ครั้ง → ตอบพร้อม status code
import type { Request, Response } from "express";
import type { TokenPayload } from "../lib/jwt.js";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js";
import * as authService from "../services/auth.service.js";

export async function register(_req: Request, res: Response) {
  const input: RegisterInput = res.locals.valid.body;
  const result = await authService.register(input);
  res.status(201).json({ data: result });
}

export async function login(_req: Request, res: Response) {
  const input: LoginInput = res.locals.valid.body;
  const result = await authService.login(input);
  res.status(200).json({ data: result });
}

export async function me(_req: Request, res: Response) {
  const { userId } = res.locals.user as TokenPayload;
  const user = await authService.getMe(userId);
  res.status(200).json({ data: user });
}
