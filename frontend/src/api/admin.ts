// src/api/admin.ts — งานของแอดมิน
import { api } from "./client";
import type { AdminPayment, Appointment, AppointmentStatus, Customer, Dashboard, Employee, Room, Service } from "../types";

/* ---------- ภาพรวม · ลูกค้า ---------- */
export async function getDashboard(): Promise<Dashboard> {
  return (await api.get<{ data: Dashboard }>("/dashboard")).data.data;
}

export async function listCustomers(): Promise<Customer[]> {
  return (await api.get<{ data: Customer[] }>("/customers")).data.data;
}

/* ---------- คิว ---------- */
export async function listAppointments(): Promise<Appointment[]> {
  return (await api.get<{ data: Appointment[] }>("/appointments")).data.data;
}

export type AppointmentPatch = { employeeId?: number | null; roomId?: number | null; status?: AppointmentStatus };

export async function updateAppointment(id: number, patch: AppointmentPatch): Promise<Appointment> {
  return (await api.patch<{ data: Appointment }>(`/appointments/${id}`, patch)).data.data;
}

/* ---------- การชำระเงิน ---------- */
export async function listPayments(): Promise<AdminPayment[]> {
  return (await api.get<{ data: AdminPayment[] }>("/payments")).data.data;
}

export async function updatePayment(id: number, status: "PAID" | "FAILED"): Promise<AdminPayment> {
  return (await api.patch<{ data: AdminPayment }>(`/payments/${id}`, { status })).data.data;
}

/* ---------- บริการ · พนักงาน · ห้อง (CRUD แบบเดียวกันทั้ง 3 อย่าง) ---------- */
export type ServiceInput = Omit<Service, "id">;
export type EmployeeInput = Omit<Employee, "id">;
export type RoomInput = Omit<Room, "id">;

export const services = {
  create: async (input: ServiceInput) => (await api.post<{ data: Service }>("/services", input)).data.data,
  update: async (id: number, input: ServiceInput) => (await api.patch<{ data: Service }>(`/services/${id}`, input)).data.data,
  remove: async (id: number) => void (await api.delete(`/services/${id}`)),
};

export const employees = {
  list: async () => (await api.get<{ data: Employee[] }>("/employees")).data.data,
  create: async (input: EmployeeInput) => (await api.post<{ data: Employee }>("/employees", input)).data.data,
  update: async (id: number, input: EmployeeInput) => (await api.patch<{ data: Employee }>(`/employees/${id}`, input)).data.data,
  remove: async (id: number) => void (await api.delete(`/employees/${id}`)),
};

export const rooms = {
  list: async () => (await api.get<{ data: Room[] }>("/rooms")).data.data,
  create: async (input: RoomInput) => (await api.post<{ data: Room }>("/rooms", input)).data.data,
  update: async (id: number, input: RoomInput) => (await api.patch<{ data: Room }>(`/rooms/${id}`, input)).data.data,
  remove: async (id: number) => void (await api.delete(`/rooms/${id}`)),
};
