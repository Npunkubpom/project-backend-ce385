// src/lib/jwt.ts — ออกและตรวจ token (JWT)
// token คือ "บัตรผ่าน" ที่เซิร์ฟเวอร์เซ็นด้วย JWT_SECRET — ใครแก้ข้อมูลในบัตร ลายเซ็นจะไม่ตรงทันที
import "dotenv/config";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
  throw new Error("JWT_SECRET ใน .env ต้องยาวอย่างน้อย 32 ตัวอักษร");
}

/** ข้อมูลที่ฝังในบัตร — ห้ามใส่ข้อมูลลับ เพราะใครก็ถอดอ่านได้ (แต่แก้ไม่ได้) */
export interface TokenPayload {
  userId: number;
  role: "ADMIN" | "USER";
  customerId: number | null;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, secret!, { expiresIn: "8h" });
}

/** คืน payload ถ้าบัตรถูกต้องและยังไม่หมดอายุ · ไม่ถูกต้องคืน null */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret!, { algorithms: ["HS256"] }) as jwt.JwtPayload & TokenPayload;
    return { userId: decoded.userId, role: decoded.role, customerId: decoded.customerId };
  } catch {
    return null;
  }
}
