// src/types.ts — รูปร่างข้อมูลที่ backend ส่งกลับมา (ตรงกับสัญญา API)
// วันที่ใน JSON เป็นข้อความ ไม่ใช่ Date

export type Role = "ADMIN" | "USER";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";
export type PaymentMethod = "BANK_TRANSFER" | "PAY_AT_SHOP";
export type RoomStatus = "AVAILABLE" | "UNAVAILABLE";

export type User = { id: number; username: string; role: Role; name: string };
export type AuthResult = { token: string; user: User };

export type Service = { id: number; name: string; price: number; duration: number; description: string | null };
export type Employee = { id: number; firstName: string; lastName: string; phone: string };
export type Room = { id: number; name: string; status: RoomStatus };

export type Payment = {
  id: number;
  appointmentId: number;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  receiptNo: string | null;
  createdAt: string;
};

export type Appointment = {
  id: number;
  customerId: number;
  serviceId: number;
  employeeId: number | null;
  roomId: number | null;
  startAt: string;
  endAt: string;
  price: number;
  status: AppointmentStatus;
  note: string | null;
  service: { name: string; duration: number };
  customer: { firstName: string; lastName: string; phone: string };
  employee: { firstName: string; lastName: string } | null;
  room: { name: string } | null;
  payment: Payment | null;
};

export type AdminPayment = Payment & {
  appointment: {
    id: number;
    startAt: string;
    service: { name: string };
    customer: { firstName: string; lastName: string };
  };
};

export type Customer = {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  username: string | null;
  appointmentCount: number;
};

export type Dashboard = {
  customers: number;
  appointments: number;
  pendingAppointments: number;
  pendingPayments: number;
  revenue: number;
};
