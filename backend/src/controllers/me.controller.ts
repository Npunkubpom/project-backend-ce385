// src/controllers/me.controller.ts — ลูกค้าที่ล็อกอินอยู่ (/api/v1/me/...)
// customerId มาจาก token เท่านั้น — client ไม่มีทางส่งรหัสลูกค้าคนอื่นเข้ามาได้
import type { Request, Response } from "express";
import type { TokenPayload } from "../lib/jwt.js";
import type { CreateBookingInput, CreatePaymentInput } from "../schemas/appointment.schema.js";
import * as appointmentService from "../services/appointment.service.js";
import * as paymentService from "../services/payment.service.js";

const customerIdOf = (res: Response) => (res.locals.user as TokenPayload).customerId as number;

export async function listBookings(_req: Request, res: Response) {
  res.status(200).json({ data: await appointmentService.listMyBookings(customerIdOf(res)) });
}

export async function createBooking(_req: Request, res: Response) {
  const input: CreateBookingInput = res.locals.valid.body;
  const created = await appointmentService.createBooking(customerIdOf(res), input);
  res.status(201).location(`/api/v1/me/bookings/${created.id}`).json({ data: created });
}

export async function cancelBooking(_req: Request, res: Response) {
  const { id } = res.locals.valid.params as { id: number };
  res.status(200).json({ data: await appointmentService.cancelMyBooking(customerIdOf(res), id) });
}

export async function createPayment(_req: Request, res: Response) {
  const input: CreatePaymentInput = res.locals.valid.body;
  res.status(201).json({ data: await paymentService.createPayment(customerIdOf(res), input) });
}
