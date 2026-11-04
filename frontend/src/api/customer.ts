// src/api/customer.ts — บริการของร้าน (ดูได้ทุกคน) + งานของลูกค้า (/me)
import { api } from "./client";
import type { Appointment, Payment, PaymentMethod, Service } from "../types";

export async function listServices(): Promise<Service[]> {
  const res = await api.get<{ data: Service[] }>("/services");
  return res.data.data;
}

export async function listMyBookings(): Promise<Appointment[]> {
  const res = await api.get<{ data: Appointment[] }>("/me/bookings");
  return res.data.data;
}

export type BookingInput = { serviceId: number; date: string; time: string; note?: string };

export async function createBooking(input: BookingInput): Promise<Appointment> {
  const res = await api.post<{ data: Appointment }>("/me/bookings", input);
  return res.data.data;
}

export async function cancelBooking(id: number): Promise<Appointment> {
  const res = await api.patch<{ data: Appointment }>(`/me/bookings/${id}`, { status: "CANCELLED" });
  return res.data.data;
}

export async function payBooking(appointmentId: number, method: PaymentMethod): Promise<Payment> {
  const res = await api.post<{ data: Payment }>("/me/payments", { appointmentId, method });
  return res.data.data;
}
