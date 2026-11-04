import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getErrorMessage } from "../api/client";
import { cancelBooking, listMyBookings, payBooking } from "../api/customer";
import { ErrorBox, PageHeader } from "../components/ui";
import { appointmentStatusText, badgeClass, dateTime, money, paymentMethodText, paymentStatusText } from "../format";
import type { Appointment, PaymentMethod } from "../types";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function reload() {
    setBookings(await listMyBookings());
  }

  useEffect(() => {
    reload()
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  async function handleCancel(b: Appointment) {
    if (!confirm(`ยกเลิกคิว ${b.service.name} ใช่ไหม?`)) return;
    try {
      setError("");
      await cancelBooking(b.id);
      await reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handlePay(b: Appointment, method: PaymentMethod) {
    try {
      setError("");
      await payBooking(b.id, method); // ส่งแค่ช่องทาง — ยอดเงิน backend ใช้ราคาของคิว
      await reload();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <>
      <PageHeader eyebrow="MY BOOKINGS" title="คิวของฉัน">
        <Link to="/book" className="btn-primary">
          + จองคิวใหม่
        </Link>
      </PageHeader>
      <ErrorBox message={error} />
      {loading && <p className="text-muted">กำลังโหลด...</p>}
      {!loading && bookings.length === 0 && <p className="card p-8 text-center text-muted">ยังไม่มีคิว</p>}

      <div className="space-y-3">
        {bookings.map((b) => {
          const upcoming = new Date(b.startAt) > new Date();
          const canCancel = upcoming && (b.status === "PENDING" || b.status === "CONFIRMED") && b.payment?.status !== "PAID";
          const canPay = b.status !== "CANCELLED" && !b.payment;

          return (
            <article key={b.id} className="card flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{b.service.name}</h2>
                  <span className={badgeClass(b.status)}>{appointmentStatusText[b.status]}</span>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {dateTime(b.startAt)} · {b.service.duration} นาที · {money(b.price)}
                </p>
                {b.employee && b.room && (
                  <p className="text-sm text-muted">
                    พนักงาน {b.employee.firstName} · {b.room.name}
                  </p>
                )}
                {b.payment && (
                  <p className="mt-1 text-sm">
                    การชำระเงิน: <span className={badgeClass(b.payment.status)}>{paymentStatusText[b.payment.status]}</span>{" "}
                    <span className="text-muted">({paymentMethodText[b.payment.method]})</span>
                    {b.payment.receiptNo && <span className="ml-2 font-mono text-xs">ใบเสร็จ {b.payment.receiptNo}</span>}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {canPay && (
                  <>
                    <button className="btn-primary btn-sm" onClick={() => handlePay(b, "BANK_TRANSFER")}>
                      แจ้งโอนเงิน
                    </button>
                    <button className="btn-outline btn-sm" onClick={() => handlePay(b, "PAY_AT_SHOP")}>
                      ชำระที่ร้าน
                    </button>
                  </>
                )}
                {canCancel && (
                  <button className="btn-danger btn-sm" onClick={() => handleCancel(b)}>
                    ยกเลิกคิว
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
