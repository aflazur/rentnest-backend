import { Role } from "../../../generated/prisma/enums";

export type TRegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Extract<Role, "TENANT" | "LANDLORD">;
};

export type TLoginPayload = {
  email: string;
  password: string;
};

export type TJwtPayload = {
  id: string;
  email: string;
  name: string;
  role: Role;
};