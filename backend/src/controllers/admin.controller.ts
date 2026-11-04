// src/controllers/admin.controller.ts — งานของแอดมิน: คิว · การชำระเงิน · ลูกค้า · ภาพรวม
import type { Request, Response } from "express";
import type { UpdateAppointmentInput, UpdatePaymentInput } from "../schemas/appointment.schema.js";
import * as appointmentService from "../services/appointment.service.js";
import * as customerService from "../services/customer.service.js";
import * as dashboardService from "../services/dashboard.service.js";
import * as paymentService from "../services/payment.service.js";

export async function listAppointments(_req: Request, res: Response) {
  res.status(200).json({ data: await appointmentService.listAppointments() });
}

export async function updateAppointment(_req: Request, res: Response) {
  const { id } = res.locals.valid.params as { id: number };
  const input: UpdateAppointmentInput = res.locals.valid.body;
  res.status(200).json({ data: await appointmentService.updateAppointment(id, input) });
}

export async function listPayments(_req: Request, res: Response) {
  res.status(200).json({ data: await paymentService.listPayments() });
}

export async function updatePayment(_req: Request, res: Response) {
  const { id } = res.locals.valid.params as { id: number };
  const input: UpdatePaymentInput = res.locals.valid.body;
  res.status(200).json({ data: await paymentService.updatePaymentStatus(id, input) });
}

export async function listCustomers(_req: Request, res: Response) {
  res.status(200).json({ data: await customerService.listCustomers() });
}

export async function dashboard(_req: Request, res: Response) {
  res.status(200).json({ data: await dashboardService.getSummary() });
}
