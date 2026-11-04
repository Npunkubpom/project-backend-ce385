# August Spa — ระบบจัดการร้านนวด (CE385)

ลูกค้าสมัครสมาชิก → จองคิว → แจ้งชำระเงิน → ยกเลิกคิวของตัวเองได้
แอดมินจัดพนักงาน/ห้องให้คิว → ยืนยันคิว → ยืนยันการชำระเงิน (ออกเลขใบเสร็จ) → จัดการบริการ พนักงาน ห้อง

| ส่วน | เทคโนโลยี |
|---|---|
| frontend | React · TypeScript · Tailwind CSS · Axios · Zod (+ React Router) |
| backend | Node.js · Express 5 · TypeScript · Zod · Prisma 7 |
| database | PostgreSQL |
| ความปลอดภัย | bcryptjs (แฮชรหัสผ่าน) · jsonwebtoken (JWT) · cors |

โครงทั้งหมดเขียนตามแบบในสไลด์: **สัปดาห์ 8** (REST + Zod + error handler รวมศูนย์) · **สัปดาห์ 10** (Controller → Service → Repository) · **สัปดาห์ 13** (React + Axios + CORS)

---

## 1. ติดตั้งและเปิดใช้งาน

ต้องมี **Node.js 20.19 ขึ้นไป** และ **PostgreSQL** (สร้างฐานข้อมูลชื่อ `spa_db` ใน pgAdmin ไว้ก่อน)

**หน้าต่างที่ 1 — backend**
```
cd backend
copy .env.example .env               # PowerShell: Copy-Item .env.example .env · macOS/Linux: cp
```
เปิด `.env` แก้ `myPassword` เป็นรหัสผ่าน PostgreSQL ของตัวเอง และเปลี่ยน `JWT_SECRET` เป็นข้อความสุ่มยาว ๆ (ต้องทำก่อน `npm install`) แล้วสั่ง
```
npm install
npx prisma migrate dev --name init   # สร้างตาราง
npm run seed                         # ใส่ข้อมูลตัวอย่าง + บัญชี admin
npm run dev                          # เปิดที่ http://localhost:3000
```

**หน้าต่างที่ 2 — frontend**
```
cd frontend
npm install
npm run dev                          # เปิด http://localhost:5173
```

**ทางเลือก: ใช้ไฟล์ SQL แทน migrate + seed** — `database/spa_db.sql` สร้างตารางพร้อมข้อมูลตัวอย่างในไฟล์เดียว
เปิดใน pgAdmin (Query Tool → Execute) กับฐานข้อมูลที่ยังว่าง แล้วข้ามสองคำสั่ง `prisma migrate dev` กับ `npm run seed` ไปรัน `npm run dev` ได้เลย (เลือกทางใดทางหนึ่ง อย่าทำทั้งสองทางกับฐานข้อมูลเดียวกัน) · มีลูกค้าเพิ่ม `wichai` / `Wichai2026` และคิว/การชำระเงินตัวอย่าง

**บัญชีทดลอง**
| บทบาท | ชื่อผู้ใช้ | รหัสผ่าน |
|---|---|---|
| แอดมิน | `admin` | ค่า `ADMIN_PASSWORD` ใน `.env` (ค่าเริ่มต้น `Admin1234`) |
| ลูกค้า | `somsri` | `Somsri2026` |

---

## 2. โครงสร้างโปรเจกต์

```
spa-app/
├─ backend/
│  ├─ .env.example · prisma.config.ts · package.json · tsconfig.json
│  ├─ prisma/
│  │  ├─ schema.prisma        ตาราง 7 ตาราง: users customers services employees rooms appointments payments
│  │  └─ seed.ts              ข้อมูลตัวอย่าง
│  └─ src/
│     ├─ server.ts            เปิดพอร์ต
│     ├─ app.ts               ลำดับ middleware (อ่านไฟล์นี้ไฟล์เดียวเห็นทางเดินของคำขอทั้งหมด)
│     ├─ routes/              แผนที่: method + path → ด่านตรวจ → controller
│     ├─ controllers/         แปลภาษา HTTP: หยิบข้อมูล → เรียก service → ตอบ status code
│     ├─ services/            กฎของร้าน (เวลาทำการ คิวทับกัน การชำระเงิน การล็อกอิน)
│     ├─ repositories/        ชั้นเดียวที่คุยกับฐานข้อมูล (prisma)
│     ├─ schemas/             Zod — รูปร่างข้อมูลที่ยอมรับ
│     ├─ middlewares/         logger · validate · auth (authenticate/authorize) · error-handler
│     ├─ errors/app-error.ts  notFound / conflict / unauthorized / forbidden
│     └─ lib/                 prisma.ts · jwt.ts
└─ frontend/src/
   ├─ api/                    client.ts (Axios + แนบ token) · auth.ts · customer.ts · admin.ts
   ├─ auth/                   AuthContext (สถานะล็อกอิน) · RequireRole (กั้นหน้าตามบทบาท)
   ├─ layouts/                PublicLayout (เมนูเต็มจอ) · AdminLayout (แถบด้านข้าง)
   ├─ components/             FullscreenMenu · ui
   ├─ pages/                  หน้าของลูกค้า + pages/admin/ หน้าของแอดมิน
   ├─ schemas.ts              Zod ตรวจฟอร์มก่อนส่ง
   └─ types.ts · format.ts
```

กฎทิศทางการ import (สัปดาห์ 10): `routes → controllers → services → repositories → prisma` ห้ามข้ามชั้น ห้ามย้อนกลับ

---

## 3. อธิบายตอนพรีเซนต์ (ประมาณ 5 นาที)

### 3.1 เดินตามคำขอ 1 ใบ: ลูกค้ากด "ส่งคำขอจองคิว"

1. **หน้าเว็บ** `BookPage.tsx` ตรวจฟอร์มด้วย Zod ก่อน → เรียก `createBooking()` ใน `api/customer.ts`
2. **Axios** (`api/client.ts`) แนบ `Authorization: Bearer <token>` ให้อัตโนมัติ แล้วส่ง `POST /api/v1/me/bookings`
3. **app.ts** → `cors` (อนุญาตเฉพาะหน้าเว็บเรา) → `express.json` → `logger` → `meRouter`
4. **me.route.ts** → ด่าน `authenticate` (ตรวจ token: ไม่มี/ปลอม/หมดอายุ = 401) → `authorize("USER")` (แอดมิน = 403) → `validate(createBookingSchema)` (ข้อมูลผิด = 422)
5. **me.controller.ts** หยิบ `customerId` **จาก token** + ข้อมูลที่ผ่านการตรวจ → เรียก service
6. **appointment.service.ts** ตรวจกฎ: บริการมีจริง · อยู่ในเวลา 09:00–21:00 · ไม่ย้อนหลัง · ลูกค้าไม่มีคิวทับ → ราคาเอาจากฐานข้อมูล
7. **appointment.repository.ts** สั่ง `prisma.appointment.create(...)`
8. ตอบ `201 Created` กลับไป — ถ้ามีอะไรผิดตรงไหน `throw` ออกมา แล้ว **error-handler.ts** แปลงเป็น status code ที่ถูกต้องที่เดียว

### 3.2 ความปลอดภัย — ป้องกันอะไร ด้วยอะไร อยู่ไฟล์ไหน

| ภัย | ป้องกันอย่างไร | ไฟล์ |
|---|---|---|
| รหัสผ่านรั่วจากฐานข้อมูล | เก็บเฉพาะค่าแฮช bcrypt (มี salt) ไม่เคยเก็บรหัสจริง · ไม่ส่ง `passwordHash` ออก API | `auth.service.ts` · `user.repository.ts` |
| เดาชื่อผู้ใช้ | ชื่อผิดหรือรหัสผิดตอบข้อความเดียวกัน (401) และใช้เวลาเท่ากัน | `auth.service.ts` |
| ปลอมตัวตน | JWT เซ็นด้วย `JWT_SECRET` · แก้ข้อมูลในบัตร (เช่น role) ลายเซ็นจะไม่ตรง → 401 · หมดอายุใน 8 ชม. | `lib/jwt.ts` · `middlewares/auth.ts` |
| เข้าส่วนที่ไม่มีสิทธิ์ | `authenticate` (401) + `authorize("ADMIN")` (403) ทุกเส้นทางที่ต้องใช้ | `routes/*.ts` |
| ดู/แก้คิวของคนอื่น (IDOR) | `customerId` มาจาก token เท่านั้น · ค้นด้วย `id + customerId` คิวคนอื่นจึง "ไม่พบ" (404) | `me.controller.ts` · `appointment.repository.ts` |
| ส่งฟิลด์เกิน เช่น `role`, `price`, `amount` | Zod `strictObject` ตีกลับฟิลด์ที่ไม่รู้จัก (422) · ราคา/ยอดเงินเอาจากฐานข้อมูลเสมอ | `schemas/*.ts` |
| SQL Injection | Prisma ส่งค่าแบบ parameterized ทุกคำสั่ง + Zod ตรวจรูปแบบก่อน | `repositories/*.ts` |
| XSS | React แสดงข้อความแบบ escape อัตโนมัติ (ไม่ใช้ `dangerouslySetInnerHTML`) | หน้าเว็บทั้งหมด |
| เว็บอื่นเรียก API ของเรา | CORS อนุญาตเฉพาะ `FRONTEND_URL` | `app.ts` |
| ส่งข้อมูลก้อนใหญ่ถล่ม | `express.json({ limit: "10kb" })` → 413 | `app.ts` |
| ข้อมูลภายในรั่ว | error 500 ตอบข้อความกลาง ๆ ไม่ส่ง SQL/stack · ปิด header `x-powered-by` | `error-handler.ts` · `app.ts` |
| ชำระซ้ำ / จองซ้อนพร้อมกัน | service ตรวจก่อน + `@unique` ในฐานข้อมูลเป็นด่านสุดท้าย (409) | `payment.service.ts` · `schema.prisma` |
| รหัสลับหลุดขึ้น GitHub | เก็บใน `.env` ซึ่งอยู่ใน `.gitignore` | `.env.example` |

### 3.3 ทำไม 401 / 403 / 404 / 409 / 422 ต่างกัน

| รหัส | ความหมาย | ตัวอย่างในระบบนี้ |
|---|---|---|
| 400 | คำขอผิดรูป | `/appointments/abc` · จองนอกเวลาทำการ |
| 401 | ยังไม่ได้ยืนยันตัวตน | ไม่มี token / token ปลอม / รหัสผ่านผิด |
| 403 | ยืนยันแล้ว แต่ไม่มีสิทธิ์ | ลูกค้าเรียก `/appointments` |
| 404 | ไม่พบ | คิวของคนอื่น · id ที่ไม่มี |
| 409 | ชนกับของที่มีอยู่ | ชื่อผู้ใช้ซ้ำ · คิวทับเวลา · ชำระซ้ำ · ลบพนักงานที่มีคิว |
| 422 | รูปแบบถูก แต่เนื้อหาใช้ไม่ได้ | ไม่กรอกชื่อ · ส่ง `role` มาตอนสมัคร |

---

## 4. API (ทุกเส้นขึ้นต้นด้วย `/api/v1`)

| Method & Path | สิทธิ์ | หน้าที่ |
|---|---|---|
| `POST /auth/register` · `POST /auth/login` | ทุกคน | สมัคร / เข้าสู่ระบบ → ได้ `{ token, user }` |
| `GET /auth/me` | ล็อกอินแล้ว | ผู้ใช้ปัจจุบัน |
| `GET /services` · `GET /services/:id` | ทุกคน | ดูบริการ |
| `POST · PATCH · DELETE /services[/:id]` | ADMIN | จัดการบริการ |
| `GET · POST · PATCH · DELETE /employees[/:id]` · `/rooms[/:id]` | ADMIN | จัดการพนักงาน / ห้อง |
| `GET /me/bookings` · `POST /me/bookings` | USER | ดู / จองคิวของตัวเอง |
| `PATCH /me/bookings/:id` `{ "status": "CANCELLED" }` | USER | ยกเลิกคิวของตัวเอง |
| `POST /me/payments` `{ appointmentId, method }` | USER | แจ้งชำระเงิน |
| `GET /appointments` · `PATCH /appointments/:id` | ADMIN | ดูคิว · จัดพนักงาน/ห้อง · เปลี่ยนสถานะ |
| `GET /payments` · `PATCH /payments/:id` `{ "status": "PAID" }` | ADMIN | ยืนยันการชำระ (ออกเลขใบเสร็จ) |
| `GET /customers` · `GET /dashboard` | ADMIN | รายชื่อลูกค้า · ตัวเลขสรุป |

ข้อผิดพลาดตอบรูปแบบเดียวทั้งระบบ: `{ "error": { "code": "...", "message": "ข้อความภาษาไทย", "details": [...] } }`

---

## 5. สาธิตความปลอดภัยด้วย curl (ใช้ตอนพรีเซนต์ได้)

```powershell
# 1) ไม่มี token → 401
curl.exe -i http://localhost:3000/api/v1/me/bookings

# 2) ล็อกอินลูกค้า แล้วคัดลอก token ที่ได้
curl.exe -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{\"username\":\"somsri\",\"password\":\"Somsri2026\"}'

# 3) ลูกค้าเรียกหน้าของแอดมิน → 403
curl.exe -i http://localhost:3000/api/v1/appointments -H "Authorization: Bearer <TOKEN>"

# 4) แอบส่ง role ตอนสมัคร → 422 (strictObject)
curl.exe -X POST http://localhost:3000/api/v1/auth/register -H "Content-Type: application/json" -d '{\"username\":\"hacker1\",\"password\":\"Passw0rd1\",\"firstName\":\"a\",\"lastName\":\"b\",\"phone\":\"0812345678\",\"role\":\"ADMIN\"}'

# 5) SQL injection ที่ช่องชื่อผู้ใช้ → 401 ธรรมดา
curl.exe -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d '{\"username\":\"'' OR 1=1 --\",\"password\":\"x\"}'
```

---

## 6. ถ้าแก้ `schema.prisma`

```
npx prisma migrate dev --name อธิบายสิ่งที่เปลี่ยน    # เช่น add_email_to_customer
```
ดูข้อมูลในตารางด้วย `npm run studio` (เปิด Prisma Studio)
