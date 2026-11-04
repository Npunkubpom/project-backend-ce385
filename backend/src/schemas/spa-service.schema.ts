// src/schemas/spa-service.schema.ts — บริการของร้าน (นวดแผนไทย, สปาหน้า ...)
import { z } from "zod";
import { EMPTY_PATCH, UNKNOWN_FIELD } from "./common.schema.js";

const fields = {
  name: z.string({ error: "ต้องระบุชื่อบริการ" }).trim().min(1, "ต้องระบุชื่อบริการ").max(150, "ชื่อบริการยาวเกิน 150 ตัวอักษร"),
  price: z.coerce.number({ error: "ราคาต้องเป็นตัวเลข" }).int("ราคาต้องเป็นจำนวนเต็ม").min(0, "ราคาต้องไม่ติดลบ").max(100000, "ราคาสูงเกินไป"),
  duration: z.coerce.number({ error: "ระยะเวลาต้องเป็นตัวเลข" }).int().min(15, "ระยะเวลาอย่างน้อย 15 นาที").max(480, "ระยะเวลาไม่เกิน 480 นาที"),
  description: z.string().trim().max(500, "คำอธิบายยาวเกิน 500 ตัวอักษร").nullish(),
};

export const createServiceSchema = z.strictObject(fields, { error: UNKNOWN_FIELD });

export const updateServiceSchema = z
  .strictObject(fields, { error: UNKNOWN_FIELD })
  .partial()
  .refine((body) => Object.keys(body).length > 0, { error: EMPTY_PATCH });

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;
