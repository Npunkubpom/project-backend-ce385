import { useEffect, useState } from "react";
import { listCustomers } from "../../api/admin";
import { getErrorMessage } from "../../api/client";
import { ErrorBox, PageHeader } from "../../components/ui";
import type { Customer } from "../../types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listCustomers()
      .then(setCustomers)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  return (
    <>
      <PageHeader eyebrow="CUSTOMERS" title="ลูกค้า" />
      <ErrorBox message={error} />

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>ชื่อ–นามสกุล</th>
              <th>เบอร์โทร</th>
              <th>ชื่อผู้ใช้</th>
              <th>จำนวนคิว</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>
                  {c.firstName} {c.lastName}
                </td>
                <td>{c.phone}</td>
                <td className="font-mono text-xs">{c.username ?? "—"}</td>
                <td>{c.appointmentCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="p-8 text-center text-muted">ยังไม่มีลูกค้า</p>}
      </div>
    </>
  );
}
