// src/schemas/employee.schema.ts — พนักงาน
import { z } from "zod";
import { EMPTY_PATCH, nameField, phoneField, UNKNOWN_FIELD } from "./common.schema.js";

const fields = {
  firstName: nameField("ชื่อ"),
  lastName: nameField("นามสกุล"),
  phone: phoneField,
};

export const createEmployeeSchema = z.strictObject(fields, { error: UNKNOWN_FIELD });

export const updateEmployeeSchema = z
  .strictObject(fields, { error: UNKNOWN_FIELD })
  .partial()
  .refine((body) => Object.keys(body).length > 0, { error: EMPTY_PATCH });

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
