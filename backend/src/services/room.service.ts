// src/services/room.service.ts — ห้องนวด
import * as roomRepository from "../repositories/room.repository.js";
import type { CreateRoomInput, UpdateRoomInput } from "../schemas/room.schema.js";

export function listRooms() {
  return roomRepository.findMany();
}

export function createRoom(input: CreateRoomInput) {
  return roomRepository.create(input);
}

export function updateRoom(id: number, input: UpdateRoomInput) {
  return roomRepository.update(id, input);
}

export async function deleteRoom(id: number) {
  await roomRepository.remove(id);
}
