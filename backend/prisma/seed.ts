// prisma/seed.ts — ใส่ข้อมูลตัวอย่าง (รันซ้ำได้ ผลเหมือนเดิมทุกครั้ง)
// รันด้วย: npm run seed
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || adminPassword.length < 8) {
    throw new Error("ตั้งค่า ADMIN_PASSWORD ใน .env (อย่างน้อย 8 ตัว) ก่อนรัน seed");
  }

  // ล้างของเก่า (ลบลูกก่อนแม่ เพราะมี foreign key)
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.service.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.room.deleteMany();

  await prisma.service.createMany({
    data: [
      { name: "นวดแผนไทย", price: 500, duration: 60, description: "นวดแผนไทยแบบดั้งเดิม ช่วยคลายกล้ามเนื้อและเพิ่มการไหลเวียนเลือด" },
      { name: "นวดน้ำมันอโรมา", price: 800, duration: 90, description: "นวดผ่อนคลายด้วยน้ำมันหอมระเหย เหมาะกับผู้ที่ต้องการพักผ่อนเต็มที่" },
      { name: "นวดฝ่าเท้า", price: 350, duration: 45, description: "กดจุดสะท้อนเท้า ลดอาการเมื่อยล้าจากการยืนและเดิน" },
      { name: "สปาหน้าใส", price: 1200, duration: 75, description: "ทำความสะอาดผิวหน้า พอกมาสก์ และนวดหน้าเพื่อผิวกระจ่างใส" },
      { name: "ขัดผิวและอบสมุนไพร", price: 1500, duration: 120, description: "ขัดผิวด้วยสครับธรรมชาติ ตามด้วยอบสมุนไพรไทย" },
    ],
  });

  await prisma.employee.createMany({
    data: [
      { firstName: "สมหญิง", lastName: "ใจดี", phone: "0811111111" },
      { firstName: "สมชาย", lastName: "รักงาน", phone: "0822222222" },
      { firstName: "มาลี", lastName: "สุขสบาย", phone: "0833333333" },
    ],
  });

  await prisma.room.createMany({
    data: [
      { name: "ห้อง 1", status: "AVAILABLE" },
      { name: "ห้อง 2", status: "AVAILABLE" },
      { name: "ห้อง VIP", status: "AVAILABLE" },
      { name: "ห้อง 4 (ปิดซ่อม)", status: "UNAVAILABLE" },
    ],
  });

  // บัญชีแอดมิน — รหัสผ่านแฮชด้วย bcrypt ก่อนเก็บ
  await prisma.user.create({
    data: { username: "admin", passwordHash: await bcrypt.hash(adminPassword, 10), role: "ADMIN" },
  });

  // ลูกค้าตัวอย่าง: somsri / Somsri2026
  await prisma.user.create({
    data: {
      username: "somsri",
      passwordHash: await bcrypt.hash("Somsri2026", 10),
      role: "USER",
      customer: { create: { firstName: "สมศรี", lastName: "มีสุข", phone: "0820000001" } },
    },
  });

  console.log("ใส่ข้อมูลตัวอย่างแล้ว: บริการ 5 · พนักงาน 3 · ห้อง 4 · admin + ลูกค้า somsri");
}

main()
  .catch((error) => {
    console.error("seed ไม่สำเร็จ:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
