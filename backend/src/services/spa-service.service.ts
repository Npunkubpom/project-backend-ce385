// src/services/spa-service.service.ts — บริการของร้าน
import { notFound } from "../errors/app-error.js";
import * as spaServiceRepository from "../repositories/spa-service.repository.js";
import type { CreateServiceInput, UpdateServiceInput } from "../schemas/spa-service.schema.js";

export function listServices() {
  return spaServiceRepository.findMany();
}

export async function getServiceById(id: number) {
  const service = await spaServiceRepository.findById(id);
  if (!service) throw notFound(`ไม่พบบริการ id ${id}`);
  return service;
}

export function createService(input: CreateServiceInput) {
  return spaServiceRepository.create(input);
}

// หาไม่เจอ → Prisma P2025 → 404 · ลบบริการที่มีคิวใช้อยู่ → P2003 → 409 (error-handler แปลงให้)
export function updateService(id: number, input: UpdateServiceInput) {
  return spaServiceRepository.update(id, input);
}

export async function deleteService(id: number) {
  await spaServiceRepository.remove(id);
}
