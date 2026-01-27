import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export const Roles = (...roles: ("ADMIN" | "BARBER")[]) =>
  SetMetadata(ROLES_KEY, roles);
