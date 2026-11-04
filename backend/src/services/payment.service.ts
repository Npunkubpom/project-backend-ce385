// src/services/payment.service.ts — กฎของการชำระเงิน
//   • ยอดเงินมาจากราคาของคิวเสมอ (ลูกค้าส่งยอดเองไม่ได้)
//   • 1 คิวชำระได้ครั้งเดียว (ตรวจที่นี่ + @unique ในฐานข้อมูลเป็นด่านสุดท้าย)
//   • แอดมินยืนยัน PAID → ออกเลขใบเสร็จ และแก้สถานะต่อไม่ได้อีก
import { conflict, notFound } from "../errors/app-error.js";
import * as appointmentRepository from "../repositories/appointment.repository.js";
import * as paymentRepository from "../repositories/payment.repository.js";
import type { CreatePaymentInput, UpdatePaymentInput } from "../schemas/appointment.schema.js";

export async function createPayment(customerId: number, input: CreatePaymentInput) {
  const appointment = await appointmentRepository.findByIdForCustomer(input.appointmentId, customerId);
  if (!appointment) throw notFound("ไม่พบรายการจอง");
  if (appointment.status === "CANCELLED") throw conflict("คิวนี้ถูกยกเลิกแล้ว ชำระเงินไม่ได้");
  if (appointment.payment) throw conflict("คิวนี้แจ้งชำระเงินไปแล้ว");

  return paymentRepository.create({
    appointmentId: appointment.id,
    amount: appointment.price,
    method: input.method,
  });
}

export function listPayments() {
  return paymentRepository.findMany();
}

export async function updatePaymentStatus(id: number, input: UpdatePaymentInput) {
  const payment = await paymentRepository.findById(id);
  if (!payment) throw notFound(`ไม่พบรายการชำระเงิน id ${id}`);
  if (payment.status === "PAID") throw conflict("ออกใบเสร็จแล้ว เปลี่ยนสถานะไม่ได้");

  if (input.status === "PAID") {
    // เลขใบเสร็จ: RC-ปีเดือนวัน-เลขรายการ 6 หลัก เช่น RC-20261105-000012
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" }).replaceAll("-", "");
    const receiptNo = `RC-${today}-${String(id).padStart(6, "0")}`;
    return paymentRepository.update(id, { status: "PAID", receiptNo });
  }
  return paymentRepository.update(id, { status: input.status });
}
