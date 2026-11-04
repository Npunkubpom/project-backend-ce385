import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { getErrorMessage } from "../api/client";
import { createBooking, listServices } from "../api/customer";
import { ErrorBox, Field, PageHeader } from "../components/ui";
import { money, today } from "../format";
import { bookingSchema, check } from "../schemas";
import type { Service } from "../types";

export default function BookPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({ serviceId: params.get("service") ?? "", date: "", time: "", note: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listServices()
      .then(setServices)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const selected = services.find((s) => String(s.id) === form.serviceId);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { data, error } = check(bookingSchema, form);
    if (!data) return setError(error!);

    setSaving(true);
    setError("");
    try {
      // ส่งแค่ บริการ + วัน + เวลา — ราคาและสถานะ backend กำหนดเอง
      await createBooking({ ...data, note: data.note || undefined });
      navigate("/my-bookings");
    } catch (err) {
      setError(getErrorMessage(err)); // 400 นอกเวลาทำการ / 409 คิวทับกัน
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="BOOK YOUR WELLNESS" title="จองคิว" />

      <form onSubmit={handleSubmit} className="card grid max-w-2xl gap-5 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="บริการ">
            <select className="input" value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}>
              <option value="">— เลือกบริการ —</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {money(s.price)} ({s.duration} นาที)
                </option>
              ))}
            </select>
          </Field>
          {selected && <p className="mt-2 text-sm text-muted">{selected.description}</p>}
        </div>

        <Field label="วันที่">
          <input className="input" type="date" min={today()} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        </Field>
        <Field label="เวลา (ร้านเปิด 09:00–21:00 น.)">
          <input className="input" type="time" min="09:00" max="21:00" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
        </Field>

        <div className="sm:col-span-2">
          <Field label="หมายเหตุ (ถ้ามี)">
            <textarea className="input" rows={3} maxLength={500} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <ErrorBox message={error} />
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "กำลังส่งคำขอ..." : "ส่งคำขอจองคิว"}
          </button>
        </div>
      </form>
    </>
  );
}
