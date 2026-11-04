// src/schemas/appointment.schema.ts — การจองคิวและการชำระเงิน
import { z } from "zod";
import { EMPTY_PATCH, UNKNOWN_FIELD } from "./common.schema.js";

const idField = (label: string) => z.coerce.number({ error: `ต้องเลือก${label}` }).int().positive(`ต้องเลือก${label}`);

/* ---------- ลูกค้า: POST /me/bookings ----------
   ไม่มีช่อง price / status / customerId ให้ส่ง — server กำหนดเองทั้งหมด */
export const createBookingSchema = z.strictObject(
  {
    serviceId: idField("บริการ"),
    date: z.string({ error: "ต้องระบุวันที่" }).regex(/^\d{4}-\d{2}-\d{2}$/, "วันที่ต้องอยู่ในรูปแบบ YYYY-MM-DD"),
    time: z.string({ error: "ต้องระบุเวลา" }).regex(/^([01]\d|2[0-3]):[0-5]\d$/, "เวลาต้องอยู่ในรูปแบบ HH:mm"),
    note: z.string().trim().max(500, "หมายเหตุยาวเกิน 500 ตัวอักษร").optional(),
  },
  { error: UNKNOWN_FIELD },
);

/* ---------- ลูกค้า: PATCH /me/bookings/:id — เปลี่ยนได้อย่างเดียวคือ "ยกเลิก" ---------- */
export const cancelBookingSchema = z.strictObject(
  { status: z.literal("CANCELLED", { error: "ลูกค้าเปลี่ยนสถานะได้เป็น CANCELLED เท่านั้น" }) },
  { error: UNKNOWN_FIELD },
);

/* ---------- ลูกค้า: POST /me/payments — ไม่รับยอดเงิน ยอดมาจากราคาของคิวเสมอ ---------- */
export const createPaymentSchema = z.strictObject(
  {
    appointmentId: idField("คิว"),
    method: z.enum(["BANK_TRANSFER", "PAY_AT_SHOP"], { error: "ช่องทางชำระต้องเป็น BANK_TRANSFER หรือ PAY_AT_SHOP" }),
  },
  { error: UNKNOWN_FIELD },
);

/* ---------- แอดมิน: PATCH /appointments/:id — จัดพนักงาน/ห้อง และเปลี่ยนสถานะ ---------- */
export const updateAppointmentSchema = z
  .strictObject(
    {
      employeeId: idField("พนักงาน").nullable(), // null = ยกเลิกการจัดพนักงาน
      roomId: idField("ห้อง").nullable(),
      status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"], { error: "สถานะคิวไม่ถูกต้อง" }),
    },
    { error: UNKNOWN_FIELD },
  )
  .partial()
  .refine((body) => Object.keys(body).length > 0, { error: EMPTY_PATCH });

/* ---------- แอดมิน: PATCH /payments/:id ---------- */
export const updatePaymentSchema = z.strictObject(
  { status: z.enum(["PAID", "FAILED"], { error: "สถานะต้องเป็น PAID หรือ FAILED" }) },
  { error: UNKNOWN_FIELD },
);

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
