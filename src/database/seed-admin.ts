import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as bcrypt from "bcrypt";
import { users } from "../db/schema";

async function seedAdmin() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  const db = drizzle(client);

  const hashedPassword = await bcrypt.hash("password", 10);

  await db.insert(users).values({
    name: "Administrator",
    email: "admin@sixteen.com",
    password: hashedPassword,
    role: "ADMIN",
  });

  await client.end();
}

seedAdmin().catch(console.error);
