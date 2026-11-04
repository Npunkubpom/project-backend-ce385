// src/schemas/common.schema.ts — schema ที่ใช้ร่วมกันหลายเส้นทาง
import { z } from "zod";

/* :id ใน URL — ค่าจาก URL เป็นข้อความเสมอ จึงต้อง coerce เป็นตัวเลขก่อน */
export const idParamSchema = z.strictObject({
  id: z.coerce.number({ error: "id ต้องเป็นตัวเลข" }).int("id ต้องเป็นจำนวนเต็ม").positive("id ต้องมากกว่า 0"),
});

export const UNKNOWN_FIELD = "ส่งฟิลด์ที่ระบบไม่รู้จักมาด้วย — ตรวจชื่อฟิลด์ให้ตรงกับเอกสาร";
export const EMPTY_PATCH = "ต้องส่งอย่างน้อยหนึ่งฟิลด์ที่ต้องการแก้";

export const nameField = (label: string) =>
  z.string({ error: `ต้องระบุ${label}` }).trim().min(1, `ต้องระบุ${label}`).max(100, `${label}ยาวเกิน 100 ตัวอักษร`);

export const phoneField = z
  .string({ error: "ต้องระบุเบอร์โทร" })
  .trim()
  .regex(/^0\d{8,9}$/, "เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 9–10 หลัก");
