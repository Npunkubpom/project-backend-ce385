// src/routes/employees.route.ts — /api/v1/employees (ADMIN เท่านั้น)
import { Router } from "express";
import * as employeeController from "../controllers/employee.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { idParamSchema } from "../schemas/common.schema.js";
import { createEmployeeSchema, updateEmployeeSchema } from "../schemas/employee.schema.js";

export const employeesRouter = Router();
const adminOnly = [authenticate, authorize("ADMIN")];

employeesRouter.get("/", adminOnly, employeeController.list);
employeesRouter.post("/", adminOnly, validate({ body: createEmployeeSchema }), employeeController.create);
employeesRouter.patch("/:id", adminOnly, validate({ params: idParamSchema, body: updateEmployeeSchema }), employeeController.update);
employeesRouter.delete("/:id", adminOnly, validate({ params: idParamSchema }), employeeController.remove);
