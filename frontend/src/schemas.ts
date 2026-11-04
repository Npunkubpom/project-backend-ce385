// src/schemas.ts — ตรวจฟอร์มก่อนส่ง (Zod) ด้วยกฎเดียวกับ backend
// ตรวจที่หน้าเว็บ = ผู้ใช้รู้ทันทีว่าผิดตรงไหน · แต่ backend ยังตรวจซ้ำเสมอ เพราะหน้าเว็บถูกข้ามได้
import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(1, "กรุณากรอกชื่อผู้ใช้"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export const registerSchema = z.object({
  username: z.string().trim().regex(/^[a-zA-Z0-9_]{4,20}$/, "ชื่อผู้ใช้ใช้ a-z, 0-9, _ ได้ 4–20 ตัว"),
  password: z
    .string()
    .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัว")
    .regex(/[A-Za-z]/, "รหัสผ่านต้องมีตัวอักษรภาษาอังกฤษ")
    .regex(/\d/, "รหัสผ่านต้องมีตัวเลข"),
  firstName: z.string().trim().min(1, "กรุณากรอกชื่อ"),
  lastName: z.string().trim().min(1, "กรุณากรอกนามสกุล"),
  phone: z.string().trim().regex(/^0\d{8,9}$/, "เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 9–10 หลัก"),
});

export const bookingSchema = z.object({
  serviceId: z.coerce.number().int().positive("กรุณาเลือกบริการ"),
  date: z.string().min(1, "กรุณาเลือกวันที่"),
  time: z.string().min(1, "กรุณาเลือกเวลา"),
  note: z.string().max(500, "หมายเหตุยาวเกิน 500 ตัวอักษร"),
});

/** ตรวจฟอร์ม: ผ่าน → คืน data · ไม่ผ่าน → คืนข้อความแรกที่ผิด */
export function check<T>(schema: z.ZodType<T>, values: unknown): { data?: T; error?: string } {
  const result = schema.safeParse(values);
  if (result.success) return { data: result.data };
  return { error: result.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
}
