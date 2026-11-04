// src/repositories/payment.repository.ts — การชำระเงิน
import { prisma } from "../lib/prisma.js";
import type { PaymentMethod, PaymentStatus } from "../generated/prisma/client.js";

const withDetails = {
  appointment: {
    select: {
      id: true,
      startAt: true,
      service: { select: { name: true } },
      customer: { select: { firstName: true, lastName: true } },
    },
  },
} as const;

export function findMany() {
  return prisma.payment.findMany({ include: withDetails, orderBy: { id: "desc" } });
}

export function findById(id: number) {
  return prisma.payment.findUnique({ where: { id } });
}

export function create(data: { appointmentId: number; amount: number; method: PaymentMethod }) {
  return prisma.payment.create({ data, include: withDetails });
}

export function update(id: number, data: { status: PaymentStatus; receiptNo?: string }) {
  return prisma.payment.update({ where: { id }, data, include: withDetails });
}

export function updateByAppointment(appointmentId: number, data: { status: PaymentStatus }) {
  return prisma.payment.update({ where: { appointmentId }, data });
}

export function countByStatus(status: PaymentStatus) {
  return prisma.payment.count({ where: { status } });
}

export async function sumPaid() {
  const result = await prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } });
  return result._sum.amount ?? 0;
}
