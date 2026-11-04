// src/services/dashboard.service.ts — ตัวเลขสรุปของร้าน
// ยิงหลายคำถามพร้อมกันด้วย Promise.all (สัปดาห์ที่ 4)
import * as appointmentRepository from "../repositories/appointment.repository.js";
import * as customerRepository from "../repositories/customer.repository.js";
import * as paymentRepository from "../repositories/payment.repository.js";

export async function getSummary() {
  const [customers, appointments, pendingAppointments, pendingPayments, revenue] = await Promise.all([
    customerRepository.count(),
    appointmentRepository.countAll(),
    appointmentRepository.countByStatus("PENDING"),
    paymentRepository.countByStatus("PENDING"),
    paymentRepository.sumPaid(),
  ]);
  return { customers, appointments, pendingAppointments, pendingPayments, revenue };
}
