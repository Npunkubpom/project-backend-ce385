import { useEffect, useState } from "react";
import { Link } from "react-router";
import { listServices } from "../api/customer";
import { useAuth } from "../auth/AuthContext";
import { money } from "../format";
import type { Service } from "../types";

export default function HomePage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    listServices()
      .then(setServices)
      .catch(() => setServices([]));
  }, []);

  const cta = user?.role === "ADMIN" ? { to: "/admin", text: "ไปหน้าจัดการร้าน" } : user ? { to: "/book", text: "จองคิวเลย" } : { to: "/register", text: "สมัครสมาชิกเพื่อจองคิว" };

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl bg-brand text-cream">
        <div className="absolute inset-y-0 right-0 w-full bg-[url('https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-35 sm:w-1/2 sm:opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand via-brand/90 to-brand/10" />
        <div className="relative max-w-xl px-6 py-12 sm:px-10 sm:py-16">
          <div className="text-[11px] tracking-[0.25em] text-apricot">A LITTLE MOMENT OF CALM</div>
          <h1 className="mt-3 text-3xl leading-snug font-semibold sm:text-4xl">
            ให้ทุกวันเป็นวันที่ดี
            <br />
            เริ่มต้นจากการดูแลตัวเอง
          </h1>
          <p className="mt-3 text-sm text-cream/80">นวดแผนไทย สปา และการดูแลผิว โดยทีมงานมืออาชีพ จองคิวออนไลน์ได้ตลอด 24 ชั่วโมง</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={cta.to} className="btn bg-cream text-brand hover:bg-white">
              {cta.text} ↗
            </Link>
            <Link to="/services" className="btn border border-cream/40 text-cream hover:bg-white/10">
              ดูบริการทั้งหมด
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="eyebrow">AUGUST SPA MENU</div>
        <h2 className="mt-1 mb-4 text-xl font-semibold">บริการแนะนำ</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 3).map((s) => (
            <article key={s.id} className="card p-5">
              <h3 className="font-semibold">{s.name}</h3>
              <p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted">{s.description}</p>
              <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
                <span className="text-lg font-semibold text-brand">{money(s.price)}</span>
                <span className="text-xs text-muted">{s.duration} นาที</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
