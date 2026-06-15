import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "No database connection string was provided to `neon()`.",
    );
  }
  return drizzle(neon(url), { schema });
}

let _db: ReturnType<typeof createDb> | null = null;
function getDb() {
  if (!_db) _db = createDb();
  return _db;
}

/** Lazy db — defers connection until first use (survives build) */
export const db = new Proxy<ReturnType<typeof createDb>>(
  {} as ReturnType<typeof createDb>,
  {
    get(_, prop) {
      const target = getDb();
      const value = target[prop as keyof ReturnType<typeof createDb>];
      // Bind functions so `this` refers to the actual db instance
      if (typeof value === "function") {
        return value.bind(target);
      }
      return value;
    },
  },
);
