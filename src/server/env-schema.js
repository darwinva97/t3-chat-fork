const { z } = require("zod");

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET: z.string(),
  NEXT_PUBLIC_WS_URL: z.string(),
  NEXTAUTH_URL: z.string().url(),
  SSL_PATH_CERT: z.string(),
  SSL_PATH_PKEY: z.string(),
});

module.exports.envSchema = envSchema;
