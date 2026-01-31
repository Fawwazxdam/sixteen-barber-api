import { Injectable } from "@nestjs/common";
import { DrizzleService } from "../drizzle/drizzle.service";
import { users } from "../db/schema";
import { and, eq } from "drizzle-orm";

@Injectable()
export class UsersRepository {
  constructor(private drizzle: DrizzleService) { }

  async findById(id: string) {
    return this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .then(res => res[0]);
  }

  findByEmail(email: string) {
    return this.drizzle.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then(res => res[0]);
  }

  findBarbers() {
    return this.drizzle.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, "BARBER"));
  }

  findBarberById(id: string) {
    return this.drizzle.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), eq(users.role, "BARBER")))
      .then(res => res[0]);
  }

  create(data: any) {
    return this.drizzle.db.insert(users).values(data).returning();
  }

  update(id: string, data: Partial<typeof users.$inferInsert>) {
    return this.drizzle.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
  }
}
