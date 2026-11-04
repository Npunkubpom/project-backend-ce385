// src/api/client.ts — ตั้งค่า Axios ที่เดียว (แบบสไลด์สัปดาห์ที่ 13) + แนบ token ให้ทุกคำขอ
import axios from "axios";

export const TOKEN_KEY = "spa_token";

export const api = axios.create({
  baseURL: "http://localhost:3000/api/v1", // ที่อยู่ backend ของเรา
});

// ก่อนส่งทุกคำขอ: ถ้ามี token ให้แนบไปใน header  Authorization: Bearer <token>
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ถ้า backend ตอบ 401 (token หมดอายุ/ไม่ถูกต้อง) → ลบ token แล้วพาไปหน้าเข้าสู่ระบบ
api.interceptors.response.use(undefined, (error) => {
  const isLoginRequest = error.config?.url?.startsWith("/auth/");
  if (error.response?.status === 401 && !isLoginRequest && localStorage.getItem(TOKEN_KEY)) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "/login";
  }
  return Promise.reject(error);
});

// รูปร่าง error ที่ backend ส่งมาทุกครั้ง (error-handler ของ backend)
type ApiErrorBody = {
  error: { code: string; message: string; details?: { field: string; message: string }[] };
};

/** แปลง error อะไรก็ตาม ให้เป็นข้อความที่ขึ้นบนหน้าจอได้ */
export function getErrorMessage(err: unknown): string {
  if (!axios.isAxiosError<ApiErrorBody>(err)) return "เกิดข้อผิดพลาดที่ไม่คาดคิด";
  if (!err.response) return "ติดต่อ backend ไม่ได้ — เซิร์ฟเวอร์ปิดอยู่ หรือโดน CORS บล็อก";

  const { message, details } = err.response.data.error;
  if (Array.isArray(details)) return details.map((d) => d.message).join(" · "); // 422
  return message; // 400, 401, 403, 404, 409
}
