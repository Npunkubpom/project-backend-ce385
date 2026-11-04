// src/errors/app-error.ts — ข้อผิดพลาดที่ "เราตั้งใจให้เกิด"
// error-handler จะแปลงเป็น HTTP response ตาม statusCode ที่ระบุ

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const badRequest = (message: string) => new AppError(400, "BAD_REQUEST", message);
export const unauthorized = (message: string) => new AppError(401, "UNAUTHORIZED", message);
export const forbidden = (message: string) => new AppError(403, "FORBIDDEN", message);
export const notFound = (message: string) => new AppError(404, "NOT_FOUND", message);
export const conflict = (message: string) => new AppError(409, "CONFLICT", message);
