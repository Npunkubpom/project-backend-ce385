// src/routes/me.route.ts — /api/v1/me (ลูกค้าที่ล็อกอินแล้วเท่านั้น)
import { Router } from "express";
import * as meController from "../controllers/me.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { cancelBookingSchema, createBookingSchema, createPaymentSchema } from "../schemas/appointment.schema.js";
import { idParamSchema } from "../schemas/common.schema.js";

export const meRouter = Router();

// ทุกเส้นทางในไฟล์นี้ต้องผ่าน 2 ด่านนี้ก่อน
meRouter.use(authenticate, authorize("USER"));

meRouter.get("/bookings", meController.listBookings);
meRouter.post("/bookings", validate({ body: createBookingSchema }), meController.createBooking);
meRouter.patch("/bookings/:id", validate({ params: idParamSchema, body: cancelBookingSchema }), meController.cancelBooking);
meRouter.post("/payments", validate({ body: createPaymentSchema }), meController.createPayment);
