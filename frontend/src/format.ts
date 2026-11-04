// src/format.ts — แปลงข้อมูลเป็นข้อความภาษาไทยสำหรับแสดงผล
import type { AppointmentStatus, PaymentMethod, PaymentStatus } from "./types";

export const money = (n: number) => `฿${n.toLocaleString("th-TH")}`;

/** "2026-11-06T03:00:00.000Z" → "6 พ.ย. 2569 10:00" (เวลาไทย) */
export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("th-TH", { timeZone: "Asia/Bangkok", dateStyle: "medium", timeStyle: "short" });

/** วันนี้ในรูปแบบ YYYY-MM-DD (ใช้เป็น min ของช่องเลือกวัน) */
export const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" });

export const appointmentStatusText: Record<AppointmentStatus, string> = {
  PENDING: "รอยืนยัน",
  CONFIRMED: "ยืนยันแล้ว",
  COMPLETED: "เสร็จสิ้น",
  CANCELLED: "ยกเลิก",
};

export const paymentStatusText: Record<PaymentStatus, string> = {
  PENDING: "รอตรวจสอบ",
  PAID: "ชำระแล้ว",
  FAILED: "ไม่สำเร็จ",
};

export const paymentMethodText: Record<PaymentMethod, string> = {
  BANK_TRANSFER: "โอนผ่านธนาคาร",
  PAY_AT_SHOP: "ชำระที่ร้าน",
};

const badgeColor: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-sky-100 text-sky-800",
  COMPLETED: "bg-green-100 text-green-800",
  PAID: "bg-green-100 text-green-800",
  CANCELLED: "bg-stone-200 text-stone-600",
  FAILED: "bg-red-100 text-red-700",
};

export const badgeClass = (status: string) => `rounded-full px-2.5 py-1 text-xs font-medium ${badgeColor[status] ?? ""}`;
