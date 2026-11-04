// src/controllers/employee.controller.ts — พนักงาน
import type { Request, Response } from "express";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "../schemas/employee.schema.js";
import * as employeeService from "../services/employee.service.js";

export async function list(_req: Request, res: Response) {
  res.status(200).json({ data: await employeeService.listEmployees() });
}

export async function create(_req: Request, res: Response) {
  const input: CreateEmployeeInput = res.locals.valid.body;
  const created = await employeeService.createEmployee(input);
  res.status(201).location(`/api/v1/employees/${created.id}`).json({ data: created });
}

export async function update(_req: Request, res: Response) {
  const { id } = res.locals.valid.params as { id: number };
  const input: UpdateEmployeeInput = res.locals.valid.body;
  res.status(200).json({ data: await employeeService.updateEmployee(id, input) });
}

export async function remove(_req: Request, res: Response) {
  const { id } = res.locals.valid.params as { id: number };
  await employeeService.deleteEmployee(id);
  res.status(204).end();
}
