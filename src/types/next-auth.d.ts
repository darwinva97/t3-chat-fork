import NextAuth, { Account, DefaultSession, User } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    wsToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    wsToken?: string;
  }
}
