import { useEffect, useState } from "react";
import { listPayments, updatePayment } from "../../api/admin";
import { getErrorMessage } from "../../api/client";
import { ErrorBox, PageHeader } from "../../components/ui";
import { badgeClass, dateTime, money, paymentMethodText, paymentStatusText } from "../../format";
import type { AdminPayment } from "../../types";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [error, setError] = useState("");

  async function reload() {
    setPayments(await listPayments());
  }

  useEffect(() => {
    reload().catch((err) => setError(getErrorMessage(err)));
  }, []);

  async function handleStatus(p: AdminPayment, status: "PAID" | "FAILED") {
    const text = status === "PAID" ? "ยืนยันว่าได้รับเงินแล้ว (จะออกใบเสร็จ และแก้ไขภายหลังไม่ได้)" : "ทำเครื่องหมายว่าไม่สำเร็จ";
    if (!confirm(`${text} ใช่ไหม?`)) return;
    try {
      setError("");
      await updatePayment(p.id, status);
      await reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader eyebrow="PAYMENTS" title="การชำระเงิน" />
      <ErrorBox message={error} />

      <div className="card table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>คิว</th>
              <th>ลูกค้า</th>
              <th>ยอดเงิน</th>
              <th>ช่องทาง</th>
              <th>สถานะ</th>
              <th>ใบเสร็จ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  {p.appointment.service.name}
                  <div className="text-xs text-muted">{dateTime(p.appointment.startAt)}</div>
                </td>
                <td>
                  {p.appointment.customer.firstName} {p.appointment.customer.lastName}
                </td>
                <td>{money(p.amount)}</td>
                <td>{paymentMethodText[p.method]}</td>
                <td>
                  <span className={badgeClass(p.status)}>{paymentStatusText[p.status]}</span>
                </td>
                <td className="font-mono text-xs">{p.receiptNo ?? "—"}</td>
                <td className="space-x-2 text-right">
                  {p.status === "PENDING" && (
                    <>
                      <button className="btn-primary btn-sm" onClick={() => handleStatus(p, "PAID")}>
                        ยืนยันชำระ
                      </button>
                      <button className="btn-danger btn-sm" onClick={() => handleStatus(p, "FAILED")}>
                        ไม่ผ่าน
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {payments.length === 0 && <p className="p-8 text-center text-muted">ยังไม่มีรายการชำระเงิน</p>}
      </div>
    </>
  );
}
