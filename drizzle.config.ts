import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/schema.ts",
  out: "./lib/migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Use direct connection for drizzle-kit commands (not the pooler)
    url: process.env.DIRECT_DATABASE_URL!,
  },
  // schemaFilter: ["public"], // Only use public schema, ignore auth and other Supabase schemas
});
