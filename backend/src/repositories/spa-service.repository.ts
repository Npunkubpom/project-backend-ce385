// src/repositories/spa-service.repository.ts — บริการของร้าน
import { prisma } from "../lib/prisma.js";
import type { CreateServiceInput, UpdateServiceInput } from "../schemas/spa-service.schema.js";

export function findMany() {
  return prisma.service.findMany({ orderBy: { id: "asc" } });
}

export function findById(id: number) {
  return prisma.service.findUnique({ where: { id } });
}

export function create(data: CreateServiceInput) {
  return prisma.service.create({ data });
}

export function update(id: number, data: UpdateServiceInput) {
  return prisma.service.update({ where: { id }, data });
}

export function remove(id: number) {
  return prisma.service.delete({ where: { id } });
}
