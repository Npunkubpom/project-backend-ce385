// หน้าจัดการห้องนวด — โครงเดียวกับหน้าบริการ (ฟอร์มเพิ่ม/แก้ไข + ตาราง)
import { useEffect, useState, type FormEvent } from "react";
import { rooms as roomsApi, type RoomInput } from "../../api/admin";
import { getErrorMessage } from "../../api/client";
import { ErrorBox, Field, PageHeader } from "../../components/ui";
import type { Room, RoomStatus } from "../../types";

const empty: RoomInput = { name: "", status: "AVAILABLE" };

export default function RoomsPage() {
  const [items, setItems] = useState<Room[]>([]);
  const [editing, setEditing] = useState<Room | null>(null);
  const [form, setForm] = useState<RoomInput>(empty);
  const [error, setError] = useState("");

  async function reload() {
    setItems(await roomsApi.list());
  }

  useEffect(() => {
    reload().catch((err) => setError(getErrorMessage(err)));
  }, []);

  function startEdit(room: Room) {
    setEditing(room);
    setForm({ name: room.name, status: room.status });
  }

  function resetForm() {
    setEditing(null);
    setForm(empty);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setError("");
      if (editing) await roomsApi.update(editing.id, form);
      else await roomsApi.create(form);
      resetForm();
      await reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(room: Room) {
    if (!confirm(`ลบ "${room.name}" ใช่ไหม?`)) return;
    try {
      setError("");
      await roomsApi.remove(room.id);
      await reload();
    } catch (err) {
      setError(getErrorMessage(err)); // 409 ห้องนี้มีคิวอยู่
    }
  }

  return (
    <>
      <PageHeader eyebrow="ROOMS" title="ห้องนวด" />
      <ErrorBox message={error} />

      <form onSubmit={handleSubmit} className="card mb-6 grid gap-4 p-5 sm:grid-cols-2">
        <Field label="ชื่อห้อง">
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="สถานะ">
          <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as RoomStatus })}>
            <option value="AVAILABLE">พร้อมใช้งาน</option>
            <option value="UNAVAILABLE">ปิดใช้งาน</option>
          </select>
        </Field>
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" className="btn-primary">
            {editing ? "บันทึกการแก้ไข" : "+ เพิ่มห้อง"}
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
              <th>ชื่อห้อง</th>
              <th>สถานะ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((room) => (
              <tr key={room.id}>
                <td>{room.id}</td>
                <td>{room.name}</td>
                <td>
                  <span className={`rounded-full px-2.5 py-1 text-xs ${room.status === "AVAILABLE" ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-600"}`}>
                    {room.status === "AVAILABLE" ? "พร้อมใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </td>
                <td className="space-x-2 text-right">
                  <button className="btn-outline btn-sm" onClick={() => startEdit(room)}>
                    แก้ไข
                  </button>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(room)}>
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
