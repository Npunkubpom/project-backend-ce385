// src/layouts/PublicLayout.tsx — หน้าตาสำหรับผู้เยี่ยมชมและลูกค้า: แถบด้านบน + เมนูเต็มจอ
import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext";
import FullscreenMenu, { type MenuItem } from "../components/FullscreenMenu";

export default function PublicLayout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  // เมนูเปลี่ยนตามสถานะ: ผู้เยี่ยมชม / ลูกค้า / แอดมิน
  let items: MenuItem[] = [
    { label: "หน้าแรก", to: "/" },
    { label: "บริการของเรา", to: "/services" },
  ];
  if (!user) {
    items = [...items, { label: "เข้าสู่ระบบ", to: "/login" }, { label: "สมัครสมาชิก", to: "/register" }];
  } else if (user.role === "USER") {
    items = [...items, { label: "จองคิว", to: "/book" }, { label: "คิวของฉัน", to: "/my-bookings" }, { label: "ออกจากระบบ", onClick: handleLogout }];
  } else {
    items = [...items, { label: "จัดการร้าน", to: "/admin" }, { label: "ออกจากระบบ", onClick: handleLogout }];
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 text-brand">
            <span className="grid size-9 place-items-center rounded-full border border-gold/60 text-xl">✿</span>
            <span className="font-serif text-[15px] font-semibold tracking-[0.12em]">AUGUST SPA</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <span className="hidden text-sm text-muted sm:inline">{user.name}</span>
            ) : (
              <Link to="/login" className="btn-outline btn-sm hidden sm:inline-flex">
                เข้าสู่ระบบ
              </Link>
            )}
            <button type="button" onClick={() => setMenuOpen(true)} className="btn-outline btn-sm rounded-full px-4">
              เมนู ＋
            </button>
          </div>
        </div>
      </header>

      <FullscreenMenu open={menuOpen} onClose={() => setMenuOpen(false)} items={items} heading={user ? user.name : "AUGUST SPA"} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-1 px-4 py-6 text-xs text-muted sm:flex-row sm:px-6">
          <span>© 2026 August Spa · ระบบจัดการร้านนวด</span>
          <span className="text-gold">Crafted for your peace of mind ✿</span>
        </div>
      </footer>
    </div>
  );
}
