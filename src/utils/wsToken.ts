import { TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { Session } from "next-auth";
import { env } from "../server/env";

export const verifyWsToken = (wsToken: string): Session["user"] | null => {
  const result =
    (jwt.verify(wsToken, env.WS_JWT_SECRET) as Session["user"]) || null;
  if (!result) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return result;
};
