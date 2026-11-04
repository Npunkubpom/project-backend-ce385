// src/routes/rooms.route.ts — /api/v1/rooms (ADMIN เท่านั้น)
import { Router } from "express";
import * as roomController from "../controllers/room.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { idParamSchema } from "../schemas/common.schema.js";
import { createRoomSchema, updateRoomSchema } from "../schemas/room.schema.js";

export const roomsRouter = Router();
const adminOnly = [authenticate, authorize("ADMIN")];

roomsRouter.get("/", adminOnly, roomController.list);
roomsRouter.post("/", adminOnly, validate({ body: createRoomSchema }), roomController.create);
roomsRouter.patch("/:id", adminOnly, validate({ params: idParamSchema, body: updateRoomSchema }), roomController.update);
roomsRouter.delete("/:id", adminOnly, validate({ params: idParamSchema }), roomController.remove);
