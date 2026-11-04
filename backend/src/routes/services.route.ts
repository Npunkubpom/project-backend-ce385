// src/routes/services.route.ts — /api/v1/services
// ดูรายการได้ทุกคน · เพิ่ม/แก้/ลบ เฉพาะ ADMIN
import { Router } from "express";
import * as spaServiceController from "../controllers/spa-service.controller.js";
import { authenticate, authorize } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { idParamSchema } from "../schemas/common.schema.js";
import { createServiceSchema, updateServiceSchema } from "../schemas/spa-service.schema.js";

export const servicesRouter = Router();
const adminOnly = [authenticate, authorize("ADMIN")];

servicesRouter.get("/", spaServiceController.list);
servicesRouter.get("/:id", validate({ params: idParamSchema }), spaServiceController.getById);
servicesRouter.post("/", adminOnly, validate({ body: createServiceSchema }), spaServiceController.create);
servicesRouter.patch("/:id", adminOnly, validate({ params: idParamSchema, body: updateServiceSchema }), spaServiceController.update);
servicesRouter.delete("/:id", adminOnly, validate({ params: idParamSchema }), spaServiceController.remove);
