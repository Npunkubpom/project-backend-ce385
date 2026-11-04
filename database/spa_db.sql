-- =============================================================================
-- August Spa — สร้างตาราง + ข้อมูลตัวอย่าง (ไฟล์เดียวจบ)
--
-- วิธีใช้ใน pgAdmin:
--   1) สร้างฐานข้อมูลใหม่ที่ยังว่าง เช่น spa_db
--   2) คลิกขวาที่ฐานข้อมูล → Query Tool → เปิดไฟล์นี้ → กด Execute (F5)
--
-- ⚠ เลือกใช้ทางใดทางหนึ่งเท่านั้น
--   ทาง ก) ไฟล์นี้                      (สำหรับดู/ส่ง/สาธิตใน pgAdmin)
--   ทาง ข) npx prisma migrate dev + npm run seed  (ทางที่ใช้ตอนพัฒนา)
--   ถ้ารันไฟล์นี้แล้วค่อยสั่ง prisma migrate dev ในฐานข้อมูลเดียวกัน Prisma จะขอล้างตาราง
--
-- โครงตารางตรงกับ backend/prisma/schema.prisma ทุกคอลัมน์
--
-- บัญชีตัวอย่าง (เก็บเฉพาะค่าแฮช bcrypt ไม่ได้เก็บรหัสจริง):
--   admin  / Admin1234    (แอดมิน)
--   somsri / Somsri2026   (ลูกค้า)
--   wichai / Wichai2026   (ลูกค้า)
--
-- เวลาในตาราง appointments เก็บเป็นเวลา UTC (แบบที่ Prisma เก็บ)
--   เวลาไทย = UTC + 7 ชั่วโมง เช่น 03:00 UTC = 10:00 น. เวลาไทย
-- วันที่ของคิวคำนวณจาก CURRENT_DATE จึงมีทั้งคิวที่ผ่านมาแล้วและคิวล่วงหน้าเสมอ
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1) ชนิดข้อมูลแบบตัวเลือกตายตัว (enum)
-- -----------------------------------------------------------------------------
CREATE TYPE "Role"              AS ENUM ('ADMIN', 'USER');
CREATE TYPE "RoomStatus"        AS ENUM ('AVAILABLE', 'UNAVAILABLE');
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentMethod"     AS ENUM ('BANK_TRANSFER', 'PAY_AT_SHOP');
CREATE TYPE "PaymentStatus"     AS ENUM ('PENDING', 'PAID', 'FAILED');

-- -----------------------------------------------------------------------------
-- 2) ตาราง
-- -----------------------------------------------------------------------------
-- ลูกค้า
CREATE TABLE "customers" (
    "id"         SERIAL       NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name"  VARCHAR(100) NOT NULL,
    "phone"      VARCHAR(10)  NOT NULL,
    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- บัญชีผู้ใช้: ลูกค้า (USER) ผูกกับ customers 1:1 ส่วน ADMIN ไม่ผูก
CREATE TABLE "users" (
    "id"            SERIAL       NOT NULL,
    "username"      VARCHAR(20)  NOT NULL,
    "password_hash" TEXT         NOT NULL,
    "role"          "Role"       NOT NULL DEFAULT 'USER',
    "customer_id"   INTEGER,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- บริการของร้าน (ราคาเป็นบาท ระยะเวลาเป็นนาที)
CREATE TABLE "services" (
    "id"          SERIAL       NOT NULL,
    "name"        VARCHAR(150) NOT NULL,
    "price"       INTEGER      NOT NULL,
    "duration"    INTEGER      NOT NULL,
    "description" TEXT,
    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- พนักงาน
CREATE TABLE "employees" (
    "id"         SERIAL       NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name"  VARCHAR(100) NOT NULL,
    "phone"      VARCHAR(10)  NOT NULL,
    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- ห้องนวด
CREATE TABLE "rooms" (
    "id"     SERIAL       NOT NULL,
    "name"   VARCHAR(100) NOT NULL,
    "status" "RoomStatus" NOT NULL DEFAULT 'AVAILABLE',
    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- คิวการจอง (พนักงาน/ห้องว่างได้จนกว่าแอดมินจะจัดให้ · price = ราคา ณ วันที่จอง)
CREATE TABLE "appointments" (
    "id"          SERIAL              NOT NULL,
    "customer_id" INTEGER             NOT NULL,
    "service_id"  INTEGER             NOT NULL,
    "employee_id" INTEGER,
    "room_id"     INTEGER,
    "start_at"    TIMESTAMP(3)        NOT NULL,
    "end_at"      TIMESTAMP(3)        NOT NULL,
    "price"       INTEGER             NOT NULL,
    "status"      "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "note"        VARCHAR(500),
    "created_at"  TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- การชำระเงิน (1 คิวชำระได้ครั้งเดียว · ออกเลขใบเสร็จเมื่อแอดมินยืนยัน)
CREATE TABLE "payments" (
    "id"             SERIAL          NOT NULL,
    "appointment_id" INTEGER         NOT NULL,
    "amount"         INTEGER         NOT NULL,
    "method"         "PaymentMethod" NOT NULL,
    "status"         "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "receipt_no"     VARCHAR(30),
    "created_at"     TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- -----------------------------------------------------------------------------
-- 3) ห้ามซ้ำ (UNIQUE)
-- -----------------------------------------------------------------------------
CREATE UNIQUE INDEX "users_username_key"          ON "users"("username");
CREATE UNIQUE INDEX "users_customer_id_key"       ON "users"("customer_id");
CREATE UNIQUE INDEX "payments_appointment_id_key" ON "payments"("appointment_id");
CREATE UNIQUE INDEX "payments_receipt_no_key"     ON "payments"("receipt_no");

-- -----------------------------------------------------------------------------
-- 4) ความสัมพันธ์ (FOREIGN KEY)
--    RESTRICT = ลบแถวแม่ที่ยังมีแถวลูกอ้างอยู่ไม่ได้ (เช่น ลบพนักงานที่มีคิว)
-- -----------------------------------------------------------------------------
ALTER TABLE "users"        ADD CONSTRAINT "users_customer_id_fkey"        FOREIGN KEY ("customer_id")    REFERENCES "customers"("id")    ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_fkey" FOREIGN KEY ("customer_id")    REFERENCES "customers"("id")    ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey"  FOREIGN KEY ("service_id")     REFERENCES "services"("id")     ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_employee_id_fkey" FOREIGN KEY ("employee_id")    REFERENCES "employees"("id")    ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_room_id_fkey"     FOREIGN KEY ("room_id")        REFERENCES "rooms"("id")        ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments"     ADD CONSTRAINT "payments_appointment_id_fkey"  FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================================
-- ข้อมูลตัวอย่าง
-- =============================================================================

INSERT INTO "services" ("id", "name", "price", "duration", "description") VALUES
    (1, 'นวดแผนไทย',          500,  60, 'นวดแผนไทยแบบดั้งเดิม ช่วยคลายกล้ามเนื้อและเพิ่มการไหลเวียนเลือด'),
    (2, 'นวดน้ำมันอโรมา',      800,  90, 'นวดผ่อนคลายด้วยน้ำมันหอมระเหย เหมาะกับผู้ที่ต้องการพักผ่อนเต็มที่'),
    (3, 'นวดฝ่าเท้า',          350,  45, 'กดจุดสะท้อนเท้า ลดอาการเมื่อยล้าจากการยืนและเดิน'),
    (4, 'สปาหน้าใส',          1200,  75, 'ทำความสะอาดผิวหน้า พอกมาสก์ และนวดหน้าเพื่อผิวกระจ่างใส'),
    (5, 'ขัดผิวและอบสมุนไพร', 1500, 120, 'ขัดผิวด้วยสครับธรรมชาติ ตามด้วยอบสมุนไพรไทย');

INSERT INTO "employees" ("id", "first_name", "last_name", "phone") VALUES
    (1, 'สมหญิง', 'ใจดี',    '0811111111'),
    (2, 'สมชาย',  'รักงาน',  '0822222222'),
    (3, 'มาลี',   'สุขสบาย', '0833333333');

INSERT INTO "rooms" ("id", "name", "status") VALUES
    (1, 'ห้อง 1',           'AVAILABLE'),
    (2, 'ห้อง 2',           'AVAILABLE'),
    (3, 'ห้อง VIP',         'AVAILABLE'),
    (4, 'ห้อง 4 (ปิดซ่อม)', 'UNAVAILABLE');

INSERT INTO "customers" ("id", "first_name", "last_name", "phone") VALUES
    (1, 'สมศรี', 'มีสุข', '0820000001'),
    (2, 'วิชัย', 'ใจงาม', '0820000002');

INSERT INTO "users" ("id", "username", "password_hash", "role", "customer_id") VALUES
    (1, 'admin',  '$2b$10$wMpN9Qzz8glPJyJsK1dFo.9WwkhEoNbzD/3K344J/mG3CAYBRC1GC', 'ADMIN', NULL),
    (2, 'somsri', '$2b$10$V0opilodEGTbhSo6F8WZjuWNEE5VfAn8jCLgn7AAQzbR7DgOYofAS', 'USER',  1),
    (3, 'wichai', '$2b$10$QDGfyyI8AFk4K4hCHqTqguZ9i1xwY6R3SNrf67yJ1qin6LPXJx6ru', 'USER',  2);

-- คิวตัวอย่าง (start_at เป็น UTC: + INTERVAL '3 hours' = 10:00 น. เวลาไทย)
INSERT INTO "appointments"
    ("id", "customer_id", "service_id", "employee_id", "room_id", "start_at", "end_at", "price", "status", "note") VALUES
    -- เมื่อวาน 10:00–11:00 · เสร็จแล้ว · ชำระแล้ว
    (1, 1, 1, 1, 1, CURRENT_DATE - 1 + INTERVAL '3 hours', CURRENT_DATE - 1 + INTERVAL '4 hours',         500, 'COMPLETED', NULL),
    -- เมื่อวาน 13:00–14:30 · ลูกค้ายกเลิก
    (2, 2, 2, NULL, NULL, CURRENT_DATE - 1 + INTERVAL '6 hours', CURRENT_DATE - 1 + INTERVAL '7 hours 30 minutes', 800, 'CANCELLED', NULL),
    -- พรุ่งนี้ 10:00–11:15 · ยืนยันแล้ว · แจ้งโอนรอตรวจ
    (3, 1, 4, 2, 3, CURRENT_DATE + 1 + INTERVAL '3 hours', CURRENT_DATE + 1 + INTERVAL '4 hours 15 minutes',   1200, 'CONFIRMED', 'ขอห้องที่เงียบหน่อย'),
    -- พรุ่งนี้ 14:00–14:45 · รอร้านยืนยัน (ยังไม่จัดพนักงาน/ห้อง)
    (4, 2, 3, NULL, NULL, CURRENT_DATE + 1 + INTERVAL '7 hours', CURRENT_DATE + 1 + INTERVAL '7 hours 45 minutes', 350, 'PENDING', NULL),
    -- อีก 3 วัน 15:00–17:00 · รอร้านยืนยัน
    (5, 1, 5, NULL, NULL, CURRENT_DATE + 3 + INTERVAL '8 hours', CURRENT_DATE + 3 + INTERVAL '10 hours',        1500, 'PENDING', NULL);

INSERT INTO "payments" ("id", "appointment_id", "amount", "method", "status", "receipt_no") VALUES
    (1, 1,  500, 'PAY_AT_SHOP',   'PAID',    'RC-' || to_char(CURRENT_DATE - 1, 'YYYYMMDD') || '-000001'),
    (2, 3, 1200, 'BANK_TRANSFER', 'PENDING', NULL);

-- -----------------------------------------------------------------------------
-- 5) ตั้งตัวนับ id ให้ต่อจากข้อมูลตัวอย่าง (เพราะเราใส่ id เอง)
--    ถ้าไม่ทำ แถวใหม่ที่เพิ่มจากหน้าเว็บจะได้ id = 1 ซ้ำแล้วพัง
-- -----------------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('"customers"',    'id'), (SELECT MAX("id") FROM "customers"));
SELECT setval(pg_get_serial_sequence('"users"',        'id'), (SELECT MAX("id") FROM "users"));
SELECT setval(pg_get_serial_sequence('"services"',     'id'), (SELECT MAX("id") FROM "services"));
SELECT setval(pg_get_serial_sequence('"employees"',    'id'), (SELECT MAX("id") FROM "employees"));
SELECT setval(pg_get_serial_sequence('"rooms"',        'id'), (SELECT MAX("id") FROM "rooms"));
SELECT setval(pg_get_serial_sequence('"appointments"', 'id'), (SELECT MAX("id") FROM "appointments"));
SELECT setval(pg_get_serial_sequence('"payments"',     'id'), (SELECT MAX("id") FROM "payments"));

COMMIT;

-- ลองดูผล:
-- SELECT a.id, c.first_name, s.name, a.start_at + INTERVAL '7 hours' AS เวลาไทย, a.status
-- FROM appointments a JOIN customers c ON c.id = a.customer_id JOIN services s ON s.id = a.service_id
-- ORDER BY a.start_at;
