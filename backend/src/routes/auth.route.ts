// src/routes/auth.route.ts — แผนที่ของเส้นทาง /api/v1/auth
import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../schemas/auth.schema.js";

export const authRouter = Router();

authRouter.post("/register", validate({ body: registerSchema }), authController.register);
authRouter.post("/login", validate({ body: loginSchema }), authController.login);
authRouter.get("/me", authenticate, authController.me);
// ออกจากระบบ = หน้าเว็บลบ token ทิ้ง (token หมดอายุเองใน 8 ชั่วโมง)
