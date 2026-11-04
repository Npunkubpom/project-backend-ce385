import { useEffect, useState } from "react";
import { employees as employeesApi, listAppointments, rooms as roomsApi, updateAppointment, type AppointmentPatch } from "../../api/admin";
import { getErrorMessage } from "../../api/client";
import { ErrorBox, PageHeader } from "../../components/ui";
import { appointmentStatusText, badgeClass, dateTime, money, paymentStatusText } from "../../format";
import type { Appointment, AppointmentStatus, Employee, Room } from "../../types";

const STATUSES = Object.keys(appointmentStatusText) as AppointmentStatus[];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState("");

  async function reload() {
    setAppointments(await listAppointments());
  }

  // โหลด 3 อย่างพร้อมกัน — คิว + พนักงาน + ห้อง (ไว้ใช้ในช่องเลือก)
  useEffect(() => {
    Promise.all([listAppointments(), employeesApi.list(), roomsApi.list()])
      .then(([a, e, r]) => {
        setAppointments(a);
        setEmployees(e);
        setRooms(r);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  // เปลี่ยนค่าในช่องไหน ส่ง PATCH เฉพาะช่องนั้นทันที — backend ตรวจกฎทั้งหมด (คิวทับ, ห้องปิด, ...)
  async function save(id: number, patch: AppointmentPatch) {
    try {
      setError("");
      await updateAppointment(id, patch);
    } catch (err) {
      setError(getErrorMessage(err));
    }
    await reload(); // โหลดใหม่ให้ตารางตรงกับฐานข้อมูลเสมอ (รวมกรณีที่ไม่ผ่าน)
  }

  const toId = (value: string) => (value ? Number(value) : null);

  return (
    <>
      <PageHeader eyebrow="APPOINTMENTS" title="การจองคิว" />
      <ErrorBox message={error} />

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>วันเวลา</th>
              <th>ลูกค้า</th>
              <th>บริการ</th>
              <th>พนักงาน</th>
              <th>ห้อง</th>
              <th>สถานะ</th>
              <th>ชำระเงิน</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{dateTime(a.startAt)}</td>
                <td>
                  {a.customer.firstName} {a.customer.lastName}
                  <div className="text-xs text-muted">{a.customer.phone}</div>
                </td>
                <td>
                  {a.service.name}
                  <div className="text-xs text-muted">{money(a.price)}</div>
                  {a.note && <div className="max-w-48 truncate text-xs text-muted">“{a.note}”</div>}
                </td>
                <td>
                  <select className="select-sm" value={a.employeeId ?? ""} onChange={(e) => save(a.id, { employeeId: toId(e.target.value) })}>
                    <option value="">— ยังไม่จัด —</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select className="select-sm" value={a.roomId ?? ""} onChange={(e) => save(a.id, { roomId: toId(e.target.value) })}>
                    <option value="">— ยังไม่จัด —</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id} disabled={r.status !== "AVAILABLE"}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select className="select-sm" value={a.status} onChange={(e) => save(a.id, { status: e.target.value as AppointmentStatus })}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {appointmentStatusText[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{a.payment ? <span className={badgeClass(a.payment.status)}>{paymentStatusText[a.payment.status]}</span> : <span className="text-xs text-muted">ยังไม่แจ้ง</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && <p className="p-8 text-center text-muted">ยังไม่มีคิว</p>}
      </div>
    </>
  );
}
