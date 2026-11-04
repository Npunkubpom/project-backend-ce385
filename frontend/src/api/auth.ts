// src/api/auth.ts — สมัคร / เข้าสู่ระบบ / ผู้ใช้ปัจจุบัน
import { api } from "./client";
import type { AuthResult, User } from "../types";

export type RegisterInput = { username: string; password: string; firstName: string; lastName: string; phone: string };

export async function register(input: RegisterInput): Promise<AuthResult> {
  const res = await api.post<{ data: AuthResult }>("/auth/register", input);
  return res.data.data;
}

export async function login(username: string, password: string): Promise<AuthResult> {
  const res = await api.post<{ data: AuthResult }>("/auth/login", { username, password });
  return res.data.data;
}

export async function getMe(): Promise<User> {
  const res = await api.get<{ data: User }>("/auth/me");
  return res.data.data;
}
