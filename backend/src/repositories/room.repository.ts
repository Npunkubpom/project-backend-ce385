// src/repositories/room.repository.ts — ห้องนวด
import { prisma } from "../lib/prisma.js";
import type { CreateRoomInput, UpdateRoomInput } from "../schemas/room.schema.js";

export function findMany() {
  return prisma.room.findMany({ orderBy: { id: "asc" } });
}

export function findById(id: number) {
  return prisma.room.findUnique({ where: { id } });
}

export function create(data: CreateRoomInput) {
  return prisma.room.create({ data });
}

export function update(id: number, data: UpdateRoomInput) {
  return prisma.room.update({ where: { id }, data });
}

export function remove(id: number) {
  return prisma.room.delete({ where: { id } });
}
