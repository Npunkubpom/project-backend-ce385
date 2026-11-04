// src/schemas/auth.schema.ts — สมัครสมาชิก / เข้าสู่ระบบ
import { z } from "zod";
import { nameField, phoneField, UNKNOWN_FIELD } from "./common.schema.js";

const username = z
  .string({ error: "ต้องระบุชื่อผู้ใช้" })
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{4,20}$/, "ชื่อผู้ใช้ใช้ a-z, 0-9, _ ได้ 4–20 ตัว");

const password = z
  .string({ error: "ต้องระบุรหัสผ่าน" })
  .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัว")
  .max(72, "รหัสผ่านยาวเกิน 72 ตัว") // bcrypt ใช้ได้สูงสุด 72 ไบต์
  .regex(/[A-Za-z]/, "รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษ")
  .regex(/\d/, "รหัสผ่านต้องมีตัวเลข");

// strictObject: ถ้าแอบส่ง role: "ADMIN" มาด้วย จะถูกตีกลับ 422 — สมัครเองได้แค่ USER
export const registerSchema = z.strictObject(
  {
    username,
    password,
    firstName: nameField("ชื่อ"),
    lastName: nameField("นามสกุล"),
    phone: phoneField,
  },
  { error: UNKNOWN_FIELD },
);

export const loginSchema = z.strictObject(
  {
    username: z.string({ error: "ต้องระบุชื่อผู้ใช้" }).trim().toLowerCase().min(1, "ต้องระบุชื่อผู้ใช้"),
    password: z.string({ error: "ต้องระบุรหัสผ่าน" }).min(1, "ต้องระบุรหัสผ่าน").max(72),
  },
  { error: UNKNOWN_FIELD },
);

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
