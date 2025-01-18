import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL_DEV,
});

const db = drizzle({ client: pool });

export default db;
