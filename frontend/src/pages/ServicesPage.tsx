import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getErrorMessage } from "../api/client";
import { listServices } from "../api/customer";
import { useAuth } from "../auth/AuthContext";
import { ErrorBox, PageHeader } from "../components/ui";
import { money } from "../format";
import type { Service } from "../types";

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listServices()
      .then(setServices)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader eyebrow="OUR SERVICES" title="บริการของเรา" />
      <ErrorBox message={error} />
      {loading && <p className="text-muted">กำลังโหลด...</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <article key={s.id} className="card flex flex-col p-5">
            <h2 className="font-semibold">{s.name}</h2>
            <p className="mt-1 flex-1 text-sm text-muted">{s.description}</p>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
              <div>
                <span className="text-lg font-semibold text-brand">{money(s.price)}</span>
                <span className="ml-2 text-xs text-muted">{s.duration} นาที</span>
              </div>
              {user?.role === "USER" && (
                <Link to={`/book?service=${s.id}`} className="btn-primary btn-sm">
                  จองบริการนี้
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
