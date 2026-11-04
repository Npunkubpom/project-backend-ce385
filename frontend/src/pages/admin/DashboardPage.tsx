import { useEffect, useState } from "react";
import { getDashboard } from "../../api/admin";
import { getErrorMessage } from "../../api/client";
import { ErrorBox, PageHeader } from "../../components/ui";
import { money } from "../../format";
import type { Dashboard } from "../../types";

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  const cards = data
    ? [
        { label: "ลูกค้าทั้งหมด", value: data.customers },
        { label: "คิวทั้งหมด", value: data.appointments },
        { label: "คิวรอยืนยัน", value: data.pendingAppointments },
        { label: "การชำระรอตรวจ", value: data.pendingPayments },
        { label: "รายได้ที่ชำระแล้ว", value: money(data.revenue) },
      ]
    : [];

  return (
    <>
      <PageHeader eyebrow="DASHBOARD" title="ภาพรวมร้าน" />
      <ErrorBox message={error} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <div className="text-sm text-muted">{c.label}</div>
            <div className="mt-2 text-2xl font-semibold text-brand">{c.value}</div>
          </div>
        ))}
      </div>
    </>
  );
}
