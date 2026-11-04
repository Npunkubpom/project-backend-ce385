// src/controllers/spa-service.controller.ts — บริการของร้าน
import type { Request, Response } from "express";
import type { CreateServiceInput, UpdateServiceInput } from "../schemas/spa-service.schema.js";
import * as spaService from "../services/spa-service.service.js";

export async function list(_req: Request, res: Response) {
  res.status(200).json({ data: await spaService.listServices() });
}

export async function getById(_req: Request, res: Response) {
  const { id } = res.locals.valid.params as { id: number };
  res.status(200).json({ data: await spaService.getServiceById(id) });
}

export async function create(_req: Request, res: Response) {
  const input: CreateServiceInput = res.locals.valid.body;
  const created = await spaService.createService(input);
  res.status(201).location(`/api/v1/services/${created.id}`).json({ data: created });
}

export async function update(_req: Request, res: Response) {
  const { id } = res.locals.valid.params as { id: number };
  const input: UpdateServiceInput = res.locals.valid.body;
  res.status(200).json({ data: await spaService.updateService(id, input) });
}

export async function remove(_req: Request, res: Response) {
  const { id } = res.locals.valid.params as { id: number };
  await spaService.deleteService(id);
  res.status(204).end();
}
