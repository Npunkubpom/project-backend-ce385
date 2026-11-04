// src/controllers/room.controller.ts — ห้องนวด
import type { Request, Response } from "express";
import type { CreateRoomInput, UpdateRoomInput } from "../schemas/room.schema.js";
import * as roomService from "../services/room.service.js";

export async function list(_req: Request, res: Response) {
  res.status(200).json({ data: await roomService.listRooms() });
}

export async function create(_req: Request, res: Response) {
  const input: CreateRoomInput = res.locals.valid.body;
  const created = await roomService.createRoom(input);
  res.status(201).location(`/api/v1/rooms/${created.id}`).json({ data: created });
}

export async function update(_req: Request, res: Response) {
  const { id } = res.locals.valid.params as { id: number };
  const input: UpdateRoomInput = res.locals.valid.body;
  res.status(200).json({ data: await roomService.updateRoom(id, input) });
}

export async function remove(_req: Request, res: Response) {
  const { id } = res.locals.valid.params as { id: number };
  await roomService.deleteRoom(id);
  res.status(204).end();
}
