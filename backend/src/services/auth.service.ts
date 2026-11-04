// src/services/auth.service.ts — กฎของการสมัครและเข้าสู่ระบบ
// กฎของชั้นนี้: ไม่รู้จัก express · ไม่เรียก prisma ตรง ๆ (ขอผ่าน repository)
import bcrypt from "bcryptjs";
import { conflict, notFound, unauthorized } from "../errors/app-error.js";
import { signToken } from "../lib/jwt.js";
import * as userRepository from "../repositories/user.repository.js";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema.js";

const SALT_ROUNDS = 10; // ยิ่งมากยิ่งช้า = เดารหัสยากขึ้น

// ใช้เทียบเมื่อ "ไม่พบชื่อผู้ใช้" เพื่อให้ใช้เวลาตอบพอ ๆ กับกรณีรหัสผิด (เดาไม่ได้ว่าชื่อนี้มีอยู่จริงไหม)
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", SALT_ROUNDS);

type PublicUser = NonNullable<Awaited<ReturnType<typeof userRepository.findById>>>;

/** แปลงแถวจากฐานข้อมูลเป็นข้อมูลที่ส่งให้หน้าเว็บ */
function toUserView(user: PublicUser) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.customer ? `${user.customer.firstName} ${user.customer.lastName}` : "ผู้ดูแลร้าน",
  };
}

/** ออก token ที่ฝัง id + บทบาท + รหัสลูกค้า */
function issueToken(user: PublicUser) {
  return signToken({ userId: user.id, role: user.role, customerId: user.customerId });
}

export async function register(input: RegisterInput) {
  // ตรวจก่อนเพื่อให้ได้ข้อความที่ชัด — ถ้ามีคนสมัครชื่อเดียวกันพร้อมกัน @unique จะกันเป็นด่านสุดท้าย (409)
  if (await userRepository.findByUsernameWithHash(input.username)) {
    throw conflict("ชื่อผู้ใช้นี้ถูกใช้แล้ว");
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await userRepository.createCustomerUser(input, passwordHash);
  return { token: issueToken(user), user: toUserView(user) };
}

export async function login(input: LoginInput) {
  const found = await userRepository.findByUsernameWithHash(input.username);
  const ok = await bcrypt.compare(input.password, found?.passwordHash ?? DUMMY_HASH);

  // ชื่อผิดหรือรหัสผิด ตอบข้อความเดียวกัน — ไม่บอกใบ้ว่าผิดตรงไหน
  if (!found || !ok) throw unauthorized("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");

  const { passwordHash: _hash, ...user } = found;
  return { token: issueToken(user), user: toUserView(user) };
}

export async function getMe(userId: number) {
  const user = await userRepository.findById(userId);
  if (!user) throw notFound("ไม่พบบัญชีผู้ใช้");
  return toUserView(user);
}
