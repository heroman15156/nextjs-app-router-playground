import "next-auth";
import { JWT } from "next-auth/jwt";
import type { UserRole } from "./auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    role: UserRole;
  }
}
