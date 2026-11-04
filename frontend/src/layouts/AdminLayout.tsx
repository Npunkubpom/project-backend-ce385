// src/layouts/AdminLayout.tsx — หน้าตาสำหรับแอดมิน: แถบเมนูด้านข้าง
import { NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";

const NAV = [
  { to: "/admin", label: "ภาพรวมร้าน", end: true },
  { to: "/admin/appointments", label: "การจองคิว" },
  { to: "/admin/payments", label: "การชำระเงิน" },
  { to: "/admin/customers", label: "ลูกค้า" },
  { to: "/admin/services", label: "บริการและราคา" },
  { to: "/admin/employees", label: "พนักงาน" },
  { to: "/admin/rooms", label: "ห้องนวด" },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen lg:flex">
      <aside className="flex flex-col bg-brand px-4 py-5 text-cream lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0">
        <NavLink to="/" className="mb-6 flex items-center gap-3 px-2">
          <span className="grid size-10 place-items-center rounded-full border border-gold/60 text-2xl text-apricot">✿</span>
          <span>
            <b className="block font-serif text-[15px] tracking-[0.12em]">AUGUST SPA</b>
            <small className="block text-[9px] tracking-[0.18em] text-apricot">WELLNESS MANAGEMENT</small>
          </span>
        </NavLink>

        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-3 py-2.5 text-sm transition ${isActive ? "bg-white/15 text-white" : "text-cream/80 hover:bg-white/10"}`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="mt-4 rounded-lg px-3 py-2.5 text-left text-sm text-cream/80 hover:bg-white/10 lg:mt-auto"
        >
          ออกจากระบบ
        </button>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
