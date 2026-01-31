import { Injectable } from "@nestjs/common";
import { DrizzleService } from "../drizzle/drizzle.service";
import { services } from "../db/schema";
import { eq } from "drizzle-orm";

@Injectable()
export class ServicesRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  create(data: {
    name: string;
    price: number;
    duration: number;
    isActive?: boolean;
  }) {
    return this.drizzle.db.insert(services).values(data).returning();
  }

  findAll() {
    return this.drizzle.db.select().from(services);
  }

  findById(id: string) {
    return this.drizzle.db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);
  }

  update(id: string, data: Partial<typeof services.$inferInsert>) {
    return this.drizzle.db
      .update(services)
      .set(data)
      .where(eq(services.id, id))
      .returning();
  }

  delete(id: string) {
    return this.drizzle.db.delete(services).where(eq(services.id, id));
  }
}
