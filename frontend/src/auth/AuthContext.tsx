// src/auth/AuthContext.tsx — สถานะการล็อกอินที่ทุกหน้าใช้ร่วมกัน
// สำคัญ: ส่วนนี้ใช้แค่ "เลือกว่าจะแสดงเมนู/หน้าไหน" — สิทธิ์จริงตรวจที่ backend ทุกคำขอ
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authApi from "../api/auth";
import { TOKEN_KEY } from "../api/client";
import type { AuthResult, User } from "../types";

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (input: authApi.RegisterInput) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // เปิดเว็บ: ถ้ามี token ค้างอยู่ ถาม backend ว่ายังใช้ได้ไหม
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }
    authApi
      .getMe()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  function saveSession(result: AuthResult) {
    localStorage.setItem(TOKEN_KEY, result.token);
    setUser(result.user);
    return result.user;
  }

  const login = async (username: string, password: string) => saveSession(await authApi.login(username, password));
  const register = async (input: authApi.RegisterInput) => saveSession(await authApi.register(input));
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY); // ออกจากระบบ = ทิ้งบัตรผ่าน
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth ต้องใช้ภายใน AuthProvider");
  return ctx;
}
