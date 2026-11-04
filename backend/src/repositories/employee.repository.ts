// src/repositories/employee.repository.ts — พนักงาน
import { prisma } from "../lib/prisma.js";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "../schemas/employee.schema.js";

export function findMany() {
  return prisma.employee.findMany({ orderBy: { id: "asc" } });
}

export function findById(id: number) {
  return prisma.employee.findUnique({ where: { id } });
}

export function create(data: CreateEmployeeInput) {
  return prisma.employee.create({ data });
}

export function update(id: number, data: UpdateEmployeeInput) {
  return prisma.employee.update({ where: { id }, data });
}

export function remove(id: number) {
  return prisma.employee.delete({ where: { id } });
}
