// src/schemas/room.schema.ts — ห้องนวด
import { z } from "zod";
import { EMPTY_PATCH, UNKNOWN_FIELD } from "./common.schema.js";

const fields = {
  name: z.string({ error: "ต้องระบุชื่อห้อง" }).trim().min(1, "ต้องระบุชื่อห้อง").max(100, "ชื่อห้องยาวเกิน 100 ตัวอักษร"),
  status: z.enum(["AVAILABLE", "UNAVAILABLE"], { error: "สถานะห้องต้องเป็น AVAILABLE หรือ UNAVAILABLE" }),
};

export const createRoomSchema = z.strictObject(
  { ...fields, status: fields.status.default("AVAILABLE") },
  { error: UNKNOWN_FIELD },
);

export const updateRoomSchema = z
  .strictObject(fields, { error: UNKNOWN_FIELD })
  .partial()
  .refine((body) => Object.keys(body).length > 0, { error: EMPTY_PATCH });

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
