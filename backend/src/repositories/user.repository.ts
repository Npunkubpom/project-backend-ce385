// src/repositories/user.repository.ts — ชั้นเข้าถึงข้อมูลของบัญชีผู้ใช้
// กฎของชั้นนี้ (สไลด์สัปดาห์ที่ 10): ชั้นเดียวที่เรียก prisma · ไม่รู้จัก express · ไม่โยน AppError
import { prisma } from "../lib/prisma.js";
import type { RegisterInput } from "../schemas/auth.schema.js";

// ฟิลด์ที่ส่งออกไปนอกระบบได้ — ไม่มี passwordHash เด็ดขาด
const publicFields = {
  id: true,
  username: true,
  role: true,
  customerId: true,
  customer: { select: { firstName: true, lastName: true } },
} as const;

/** ใช้ตอนล็อกอินเท่านั้น (ต้องได้ passwordHash มาเทียบ) */
export function findByUsernameWithHash(username: string) {
  return prisma.user.findUnique({ where: { username }, select: { ...publicFields, passwordHash: true } });
}

export function findById(id: number) {
  return prisma.user.findUnique({ where: { id }, select: publicFields });
}

/** สร้างลูกค้า + บัญชี พร้อมกันในคำสั่งเดียว (ถ้าอันใดพัง จะไม่เกิดทั้งคู่) */
export function createCustomerUser(input: RegisterInput, passwordHash: string) {
  return prisma.user.create({
    data: {
      username: input.username,
      passwordHash,
      role: "USER", // ล็อกไว้ที่ server — client กำหนดเองไม่ได้
      customer: { create: { firstName: input.firstName, lastName: input.lastName, phone: input.phone } },
    },
    select: publicFields,
  });
}
