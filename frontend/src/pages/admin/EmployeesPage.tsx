// หน้าจัดการพนักงาน — โครงเดียวกับหน้าบริการ (ฟอร์มเพิ่ม/แก้ไข + ตาราง)
import { useEffect, useState, type FormEvent } from "react";
import { employees as employeesApi, type EmployeeInput } from "../../api/admin";
import { getErrorMessage } from "../../api/client";
import { ErrorBox, Field, PageHeader } from "../../components/ui";
import type { Employee } from "../../types";

const empty: EmployeeInput = { firstName: "", lastName: "", phone: "" };

export default function EmployeesPage() {
  const [items, setItems] = useState<Employee[]>([]);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeInput>(empty);
  const [error, setError] = useState("");

  async function reload() {
    setItems(await employeesApi.list());
  }

  useEffect(() => {
    reload().catch((err) => setError(getErrorMessage(err)));
  }, []);

  function startEdit(emp: Employee) {
    setEditing(emp);
    setForm({ firstName: emp.firstName, lastName: emp.lastName, phone: emp.phone });
  }

  function resetForm() {
    setEditing(null);
    setForm(empty);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      setError("");
      if (editing) await employeesApi.update(editing.id, form);
      else await employeesApi.create(form);
      resetForm();
      await reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(emp: Employee) {
    if (!confirm(`ลบพนักงาน "${emp.firstName}" ใช่ไหม?`)) return;
    try {
      setError("");
      await employeesApi.remove(emp.id);
      await reload();
    } catch (err) {
      setError(getErrorMessage(err)); // 409 พนักงานคนนี้มีคิวอยู่
    }
  }

  return (
    <>
      <PageHeader eyebrow="EMPLOYEES" title="พนักงาน" />
      <ErrorBox message={error} />

      <form onSubmit={handleSubmit} className="card mb-6 grid gap-4 p-5 sm:grid-cols-3">
        <Field label="ชื่อ">
          <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </Field>
        <Field label="นามสกุล">
          <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </Field>
        <Field label="เบอร์โทร">
          <input className="input" inputMode="numeric" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <div className="flex gap-2 sm:col-span-3">
          <button type="submit" className="btn-primary">
            {editing ? "บันทึกการแก้ไข" : "+ เพิ่มพนักงาน"}
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
              <th>ชื่อ–นามสกุล</th>
              <th>เบอร์โทร</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((emp) => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>
                  {emp.firstName} {emp.lastName}
                </td>
                <td>{emp.phone}</td>
                <td className="space-x-2 text-right">
                  <button className="btn-outline btn-sm" onClick={() => startEdit(emp)}>
                    แก้ไข
                  </button>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(emp)}>
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
