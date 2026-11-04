// src/services/employee.service.ts — พนักงาน
import * as employeeRepository from "../repositories/employee.repository.js";
import type { CreateEmployeeInput, UpdateEmployeeInput } from "../schemas/employee.schema.js";

export function listEmployees() {
  return employeeRepository.findMany();
}

export function createEmployee(input: CreateEmployeeInput) {
  return employeeRepository.create(input);
}

export function updateEmployee(id: number, input: UpdateEmployeeInput) {
  return employeeRepository.update(id, input);
}

export async function deleteEmployee(id: number) {
  await employeeRepository.remove(id);
}
