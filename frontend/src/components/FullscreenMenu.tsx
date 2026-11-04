// src/components/FullscreenMenu.tsx — เมนูเต็มจอสำหรับลูกค้าและผู้เยี่ยมชม
// แอนิเมชันทั้งหมดอยู่ใน index.css (.fm-*) — component นี้แค่บอกว่าเปิดหรือปิด
import { useEffect, type CSSProperties } from "react";
import { NavLink } from "react-router";

export type MenuItem = { label: string; to?: string; onClick?: () => void };

type Props = {
  open: boolean;
  onClose: () => void;
  items: MenuItem[];
  heading: string;
};

export default function FullscreenMenu({ open, onClose, items, heading }: Props) {
  // กด Esc เพื่อปิดเมนู
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const linkClass = "fm-link relative isolate block w-full cursor-pointer overflow-hidden rounded-lg px-3 py-2 text-left";

  return (
    <div className="fm-root fixed inset-0 z-50" data-state={open ? "open" : "closed"} inert={!open}>
      <div className="fm-overlay absolute inset-0 bg-ink/60 backdrop-blur-sm" onClick={onClose} />

      <div role="dialog" aria-modal="true" aria-label="เมนูหลัก" className="absolute inset-y-0 right-0 w-full overflow-hidden text-cream sm:w-[560px]">
        {/* แผ่นสี 3 ชั้นเลื่อนเข้ามาทีละแผ่น */}
        <div className="fm-layer absolute inset-0 bg-apricot" />
        <div className="fm-layer absolute inset-0 bg-gold" />
        <div className="fm-layer absolute inset-0 bg-brand" />

        <div className="relative flex h-full flex-col overflow-y-auto px-7 pt-6 pb-8 sm:px-12">
          <div className="flex items-center justify-between">
            <p className="fm-fade text-sm text-apricot">{heading}</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="ปิดเมนู"
              className="grid size-11 cursor-pointer place-items-center rounded-full border border-cream/35 text-2xl hover:bg-cream/15"
            >
              ×
            </button>
          </div>

          <ul className="my-auto py-8">
            {items.map((item, i) => {
              const inner = (
                <>
                  <span className="fm-link-bg absolute inset-0 -z-10 rounded-lg bg-cream/12" />
                  {/* --i ใช้หน่วงเวลาให้ข้อความเด้งขึ้นทีละบรรทัด */}
                  <span className="fm-link-text text-[28px] leading-tight font-semibold sm:text-[36px]" style={{ "--i": i } as CSSProperties}>
                    {item.label}
                  </span>
                </>
              );
              return (
                <li key={item.label}>
                  {item.to ? (
                    <NavLink to={item.to} end className={linkClass} onClick={onClose}>
                      {inner}
                    </NavLink>
                  ) : (
                    <button
                      type="button"
                      className={linkClass}
                      onClick={() => {
                        onClose();
                        item.onClick?.();
                      }}
                    >
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="fm-fade text-xs text-cream/70">ดูแลทุกช่วงเวลาแห่งการพักผ่อน ✿</p>
        </div>
      </div>
    </div>
  );
}
