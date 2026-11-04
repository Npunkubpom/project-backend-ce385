// src/App.tsx — แผนผังหน้าเว็บ
//   /                    ทุกคน (เมนูเต็มจอ)
//   /book, /my-bookings  ลูกค้าที่ล็อกอินแล้ว
//   /admin/*             แอดมินเท่านั้น (แถบเมนูด้านข้าง)
import { Route, Routes } from "react-router";
import RequireRole from "./auth/RequireRole";
import AdminLayout from "./layouts/AdminLayout";
import PublicLayout from "./layouts/PublicLayout";
import AppointmentsPage from "./pages/admin/AppointmentsPage";
import CustomersPage from "./pages/admin/CustomersPage";
import DashboardPage from "./pages/admin/DashboardPage";
import EmployeesPage from "./pages/admin/EmployeesPage";
import PaymentsPage from "./pages/admin/PaymentsPage";
import RoomsPage from "./pages/admin/RoomsPage";
import ServicesAdminPage from "./pages/admin/ServicesAdminPage";
import BookPage from "./pages/BookPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import RegisterPage from "./pages/RegisterPage";
import ServicesPage from "./pages/ServicesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route element={<RequireRole role="USER" />}>
          <Route path="book" element={<BookPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
        </Route>
        <Route path="*" element={<p className="py-20 text-center text-muted">ไม่พบหน้านี้</p>} />
      </Route>

      <Route path="admin" element={<RequireRole role="ADMIN" />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="services" element={<ServicesAdminPage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="rooms" element={<RoomsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
