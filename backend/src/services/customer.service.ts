// src/services/customer.service.ts — ลูกค้า (แอดมินดูรายชื่อ)
import * as customerRepository from "../repositories/customer.repository.js";

export async function listCustomers() {
  const rows = await customerRepository.findMany();
  return rows.map((c) => ({
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    username: c.user?.username ?? null,
    appointmentCount: c._count.appointments,
  }));
}
