// src/services/appointment.service.ts — กฎของการจองคิว (หัวใจของระบบ)
//   ลูกค้า: จองได้เฉพาะเวลาทำการ · ห้ามจองย้อนหลัง · ห้ามมีคิวตัวเองทับกัน · ยกเลิกได้เฉพาะคิวของตัวเอง
//   แอดมิน: จัดพนักงาน/ห้อง · พนักงานและห้องห้ามมีคิวทับเวลากัน · ยืนยันคิวต้องมีพนักงาน+ห้องก่อน
import { badRequest, conflict, notFound } from "../errors/app-error.js";
import * as appointmentRepository from "../repositories/appointment.repository.js";
import * as employeeRepository from "../repositories/employee.repository.js";
import * as paymentRepository from "../repositories/payment.repository.js";
import * as roomRepository from "../repositories/room.repository.js";
import * as spaServiceRepository from "../repositories/spa-service.repository.js";
import type { CreateBookingInput, UpdateAppointmentInput } from "../schemas/appointment.schema.js";

export const OPEN_TIME = "09:00";
export const CLOSE_TIME = "21:00";

/** "13:30" → 810 (นาทีนับจากเที่ยงคืน) */
function toMinutes(time: string) {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return h * 60 + m;
}

/* ======================= ลูกค้า ======================= */

export function listMyBookings(customerId: number) {
  return appointmentRepository.findByCustomer(customerId);
}

export async function createBooking(customerId: number, input: CreateBookingInput) {
  const service = await spaServiceRepository.findById(input.serviceId);
  if (!service) throw notFound("ไม่พบบริการที่เลือก");

  // 1) ต้องอยู่ในเวลาทำการทั้งคิว (เริ่ม ≥ เปิดร้าน และ จบ ≤ ปิดร้าน)
  const start = toMinutes(input.time);
  if (start < toMinutes(OPEN_TIME) || start + service.duration > toMinutes(CLOSE_TIME)) {
    throw badRequest(`ร้านเปิด ${OPEN_TIME}–${CLOSE_TIME} น. และบริการนี้ใช้เวลา ${service.duration} นาที กรุณาเลือกเวลาใหม่`);
  }

  // 2) แปลงเป็นเวลาจริง (เวลาไทย +07:00) และห้ามจองย้อนหลัง
  const startAt = new Date(`${input.date}T${input.time}:00+07:00`);
  if (Number.isNaN(startAt.getTime())) throw badRequest("วันที่ไม่ถูกต้อง");
  if (startAt <= new Date()) throw badRequest("ไม่สามารถจองย้อนหลังได้ กรุณาเลือกวันและเวลาในอนาคต");
  const endAt = new Date(startAt.getTime() + service.duration * 60_000);

  // 3) ลูกค้าคนเดียวกันห้ามมีคิวทับเวลากัน
  if (await appointmentRepository.findOverlap({ customerId }, startAt, endAt)) {
    throw conflict("คุณมีคิวอื่นในช่วงเวลานี้แล้ว");
  }

  return appointmentRepository.create({
    customerId, // มาจาก token เสมอ ไม่ได้มาจาก body
    serviceId: service.id,
    startAt,
    endAt,
    price: service.price, // ราคามาจากฐานข้อมูล ลูกค้ากำหนดเองไม่ได้
    note: input.note,
  });
}

export async function cancelMyBooking(customerId: number, id: number) {
  // ค้นด้วย id + customerId — คิวของคนอื่นจะ "ไม่พบ" (ไม่บอกด้วยซ้ำว่ามีอยู่จริง)
  const appointment = await appointmentRepository.findByIdForCustomer(id, customerId);
  if (!appointment) throw notFound("ไม่พบรายการจอง");

  if (appointment.status !== "PENDING" && appointment.status !== "CONFIRMED") {
    throw conflict("คิวนี้เสร็จสิ้นหรือถูกยกเลิกไปแล้ว");
  }
  if (appointment.startAt <= new Date()) throw conflict("คิวนี้ถึงเวลาแล้ว ยกเลิกไม่ได้");
  if (appointment.payment?.status === "PAID") throw conflict("คิวนี้ชำระเงินแล้ว กรุณาติดต่อร้านเพื่อยกเลิก");

  if (appointment.payment?.status === "PENDING") {
    await paymentRepository.updateByAppointment(id, { status: "FAILED" });
  }
  return appointmentRepository.update(id, { status: "CANCELLED" });
}

/* ======================= แอดมิน ======================= */

export function listAppointments() {
  return appointmentRepository.findMany();
}

export async function updateAppointment(id: number, input: UpdateAppointmentInput) {
  const current = await appointmentRepository.findById(id);
  if (!current) throw notFound(`ไม่พบคิว id ${id}`);

  // ค่าหลังแก้ = ค่าที่ส่งมา ถ้าไม่ส่งใช้ค่าเดิม
  const employeeId = input.employeeId !== undefined ? input.employeeId : current.employeeId;
  const roomId = input.roomId !== undefined ? input.roomId : current.roomId;
  const status = input.status ?? current.status;

  if ((status === "CONFIRMED" || status === "COMPLETED") && (!employeeId || !roomId)) {
    throw badRequest("ต้องจัดพนักงานและห้องก่อนยืนยันคิว");
  }

  if (employeeId && employeeId !== current.employeeId) {
    if (!(await employeeRepository.findById(employeeId))) throw notFound("ไม่พบพนักงานที่เลือก");
  }
  if (roomId && roomId !== current.roomId) {
    const room = await roomRepository.findById(roomId);
    if (!room) throw notFound("ไม่พบห้องที่เลือก");
    if (room.status !== "AVAILABLE") throw conflict(`ห้อง "${room.name}" ปิดใช้งานอยู่`);
  }

  // พนักงาน 1 คน / ห้อง 1 ห้อง ห้ามมีคิวทับเวลากัน
  if (status !== "CANCELLED") {
    if (employeeId && (await appointmentRepository.findOverlap({ employeeId }, current.startAt, current.endAt, id))) {
      throw conflict("พนักงานคนนี้มีคิวอื่นในช่วงเวลานี้แล้ว");
    }
    if (roomId && (await appointmentRepository.findOverlap({ roomId }, current.startAt, current.endAt, id))) {
      throw conflict("ห้องนี้มีคิวอื่นในช่วงเวลานี้แล้ว");
    }
  }

  if (status === "CANCELLED" && current.payment?.status === "PENDING") {
    await paymentRepository.updateByAppointment(id, { status: "FAILED" });
  }

  return appointmentRepository.update(id, { employeeId, roomId, status });
}
