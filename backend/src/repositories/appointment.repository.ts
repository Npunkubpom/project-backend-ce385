// src/repositories/appointment.repository.ts — คิวการจอง
import { prisma } from "../lib/prisma.js";
import type { AppointmentStatus } from "../generated/prisma/client.js";

// ข้อมูลที่แนบไปกับคิวทุกครั้ง (ชื่อบริการ ลูกค้า พนักงาน ห้อง การชำระเงิน)
const withDetails = {
  service: { select: { name: true, duration: true } },
  customer: { select: { firstName: true, lastName: true, phone: true } },
  employee: { select: { firstName: true, lastName: true } },
  room: { select: { name: true } },
  payment: true,
} as const;

export function findMany() {
  return prisma.appointment.findMany({ include: withDetails, orderBy: { startAt: "desc" } });
}

export function findByCustomer(customerId: number) {
  return prisma.appointment.findMany({ where: { customerId }, include: withDetails, orderBy: { startAt: "desc" } });
}

export function findById(id: number) {
  return prisma.appointment.findUnique({ where: { id }, include: withDetails });
}

/** หาคิวของลูกค้าคนนี้เท่านั้น — ถ้าเป็นคิวของคนอื่นจะได้ null (กันการแอบดู/แก้คิวคนอื่น) */
export function findByIdForCustomer(id: number, customerId: number) {
  return prisma.appointment.findFirst({ where: { id, customerId }, include: withDetails });
}

/** หาคิวที่ "เวลาทับกัน" กับช่วง [startAt, endAt) — ไม่นับคิวที่ยกเลิก และไม่นับคิว excludeId */
export function findOverlap(
  who: { customerId?: number; employeeId?: number; roomId?: number },
  startAt: Date,
  endAt: Date,
  excludeId?: number,
) {
  return prisma.appointment.findFirst({
    where: {
      ...who,
      status: { not: "CANCELLED" },
      id: excludeId ? { not: excludeId } : undefined,
      startAt: { lt: endAt }, // เริ่มก่อนที่เราจะจบ
      endAt: { gt: startAt }, // และจบหลังที่เราเริ่ม = ทับกัน
    },
  });
}

export function create(data: {
  customerId: number;
  serviceId: number;
  startAt: Date;
  endAt: Date;
  price: number;
  note?: string;
}) {
  return prisma.appointment.create({ data, include: withDetails });
}

export function update(
  id: number,
  data: { employeeId?: number | null; roomId?: number | null; status?: AppointmentStatus },
) {
  return prisma.appointment.update({ where: { id }, data, include: withDetails });
}

export function countAll() {
  return prisma.appointment.count();
}

export function countByStatus(status: AppointmentStatus) {
  return prisma.appointment.count({ where: { status } });
}
