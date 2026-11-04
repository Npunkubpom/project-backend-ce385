// src/routes/admin.route.ts — งานของแอดมิน (ADMIN เท่านั้น)
//   /api/v1/appointments · /api/v1/payments · /api/v1/customers · /api/v1/dashboard
import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { updateAppointmentSchema, updatePaymentSchema } from "../schemas/appointment.schema.js";
import { idParamSchema } from "../schemas/common.schema.js";

export const adminRouter = Router();
const adminOnly = [authenticate, authorize("ADMIN")];

adminRouter.get("/appointments", adminOnly, adminController.listAppointments);
adminRouter.patch("/appointments/:id", adminOnly, validate({ params: idParamSchema, body: updateAppointmentSchema }), adminController.updateAppointment);

adminRouter.get("/payments", adminOnly, adminController.listPayments);
adminRouter.patch("/payments/:id", adminOnly, validate({ params: idParamSchema, body: updatePaymentSchema }), adminController.updatePayment);

adminRouter.get("/customers", adminOnly, adminController.listCustomers);
adminRouter.get("/dashboard", adminOnly, adminController.dashboard);
