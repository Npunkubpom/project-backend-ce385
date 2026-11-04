import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { ErrorBox, Field } from "../components/ui";
import { check, registerSchema } from "../schemas";

const empty = { username: "", password: "", firstName: "", lastName: "", phone: "" };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { data, error } = check(registerSchema, form);
    if (!data) return setError(error!);

    setSaving(true);
    setError("");
    try {
      await register(data);
      navigate("/book");
    } catch (err) {
      setError(getErrorMessage(err)); // 409 "ชื่อผู้ใช้นี้ถูกใช้แล้ว" ฯลฯ
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="eyebrow">JOIN AUGUST SPA</div>
      <h1 className="mt-1 mb-6 text-2xl font-semibold">สมัครสมาชิก</h1>

      <form onSubmit={handleSubmit} className="card grid gap-4 p-6 sm:grid-cols-2">
        <Field label="ชื่อ">
          <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        </Field>
        <Field label="นามสกุล">
          <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        </Field>
        <Field label="เบอร์โทร">
          <input className="input" inputMode="numeric" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </Field>
        <Field label="ชื่อผู้ใช้ (a-z, 0-9, _)">
          <input className="input" autoComplete="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="รหัสผ่าน (8 ตัวขึ้นไป มีตัวอักษรและตัวเลข)">
            <input className="input" type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <ErrorBox message={error} />
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "กำลังสมัคร..." : "สมัครสมาชิก"}
          </button>
          <p className="mt-4 text-center text-sm text-muted">
            มีบัญชีแล้ว?{" "}
            <Link to="/login" className="text-brand hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
