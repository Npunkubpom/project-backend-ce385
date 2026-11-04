// หน้าจัดการบริการ — โครงเดียวกับ App.tsx ของสัปดาห์ที่ 13 (ฟอร์มเพิ่ม/แก้ไข + ตาราง)
// หน้าพนักงานและห้องนวดเขียนแบบเดียวกันทุกอย่าง ต่างกันแค่ช่องกรอก
import { useEffect, useState, type FormEvent } from "react";
import { services as servicesApi, type ServiceInput } from "../../api/admin";
import { getErrorMessage } from "../../api/client";
import { listServices } from "../../api/customer";
import { ErrorBox, Field, PageHeader } from "../../components/ui";
import { money } from "../../format";
import type { Service } from "../../types";

const empty: ServiceInput = { name: "", price: 0, duration: 60, description: "" };

export default function ServicesAdminPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceInput>(empty);
  const [error, setError] = useState("");

  async function reload() {
    setItems(await listServices());
  }

  useEffect(() => {
    reload().catch((err) => setError(getErrorMessage(err)));
  }, []);

  function startEdit(s: Service) {
    setEditing(s);
    setForm({ name: s.name, price: s.price, duration: s.duration, description: s.description ?? "" });
  }

  function resetForm() {
    setEditing(null);
    setForm(empty);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setError("");
      if (editing) await servicesApi.update(editing.id, form);
      else await servicesApi.create(form);
      resetForm();
      await reload();
    } catch (err) {
      setError(getErrorMessage(err)); // 422 ข้อมูลผิด
    }
  }

  async function handleDelete(s: Service) {
    if (!confirm(`ลบบริการ "${s.name}" ใช่ไหม?`)) return;
    try {
      setError("");
      await servicesApi.remove(s.id);
      await reload();
    } catch (err) {
      setError(getErrorMessage(err)); // 409 มีคิวใช้บริการนี้อยู่
    }
  }

  return (
    <>
      <PageHeader eyebrow="SERVICES" title="บริการและราคา" />
      <ErrorBox message={error} />

      <form onSubmit={handleSubmit} className="card mb-6 grid gap-4 p-5 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <Field label="ชื่อบริการ">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
        </div>
        <Field label="ราคา (บาท)">
          <input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        </Field>
        <Field label="ระยะเวลา (นาที)">
          <input className="input" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
        </Field>
        <div className="sm:col-span-4">
          <Field label="คำอธิบาย">
            <input className="input" value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </Field>
        </div>
        <div className="flex gap-2 sm:col-span-4">
          <button type="submit" className="btn-primary">
            {editing ? "บันทึกการแก้ไข" : "+ เพิ่มบริการ"}
          </button>
          {editing && (
            <button type="button" className="btn-outline" onClick={resetForm}>
              ยกเลิก
            </button>
          )}
        </div>
      </form>

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>ชื่อบริการ</th>
              <th>ราคา</th>
              <th>ระยะเวลา</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>
                  {s.name}
                  <div className="max-w-80 truncate text-xs text-muted">{s.description}</div>
                </td>
                <td>{money(s.price)}</td>
                <td>{s.duration} นาที</td>
                <td className="space-x-2 text-right">
                  <button className="btn-outline btn-sm" onClick={() => startEdit(s)}>
                    แก้ไข
                  </button>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(s)}>
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
