// src/auth/RequireRole.tsx — กั้นหน้าเว็บตามบทบาท
// ยังไม่ล็อกอิน → หน้าเข้าสู่ระบบ · บทบาทไม่ตรง → หน้าแรก
// (เป็นแค่การนำทางให้ผู้ใช้ — ถึงจะแอบเปิดหน้าได้ ก็ดึงข้อมูลไม่ได้เพราะ backend ตอบ 401/403)
import { Navigate, Outlet } from "react-router";
import type { Role } from "../types";
import { useAuth } from "./AuthContext";

export default function RequireRole({ role }: { role: Role }) {
  const { user, loading } = useAuth();

  if (loading) return <p className="p-10 text-center text-muted">กำลังโหลด...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={user.role === "ADMIN" ? "/admin" : "/"} replace />;
  return <Outlet />;
}
