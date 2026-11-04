// src/repositories/customer.repository.ts — ลูกค้า
import { prisma } from "../lib/prisma.js";

export function findMany() {
  return prisma.customer.findMany({
    orderBy: { id: "desc" },
    include: {
      user: { select: { username: true } },
      _count: { select: { appointments: true } },
    },
  });
}

export function count() {
  return prisma.customer.count();
}
