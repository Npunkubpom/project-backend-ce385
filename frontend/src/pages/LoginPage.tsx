import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { ErrorBox, Field } from "../components/ui";
import { check, loginSchema } from "../schemas";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { data, error } = check(loginSchema, form); // 1) ตรวจที่หน้าเว็บก่อน
    if (!data) return setError(error!);

    setSaving(true);
    setError("");
    try {
      const user = await login(data.username, data.password); // 2) backend ตรวจอีกรอบ
      navigate(user.role === "ADMIN" ? "/admin" : "/my-bookings");
    } catch (err) {
      setError(getErrorMessage(err)); // 401 "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="eyebrow">WELCOME BACK</div>
      <h1 className="mt-1 mb-6 text-2xl font-semibold">เข้าสู่ระบบ</h1>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <Field label="ชื่อผู้ใช้">
          <input className="input" autoComplete="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </Field>
        <Field label="รหัสผ่าน">
          <input className="input" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
        <ErrorBox message={error} />
        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
        <p className="text-center text-sm text-muted">
          ยังไม่มีบัญชี?{" "}
          <Link to="/register" className="text-brand hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
      </form>
    </div>
  );
}
