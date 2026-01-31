import { Injectable } from "@nestjs/common";
import { DrizzleService } from "../drizzle/drizzle.service";
import { bookings, services } from "../db/schema";
import { and, lt, gt, gte, eq, sql, inArray } from "drizzle-orm";

@Injectable()
export class BookingsRepository {
    constructor(private readonly drizzle: DrizzleService) { }

    create(data: {
        barberId: string;
        serviceId: string;
        customerUserId?: string;
        customerName: string;
        customerPhone: string;
        customerNote?: string;
        bookingDate: Date;
    }) {
        return this.drizzle.db.insert(bookings).values(data).returning();
    }

    findAll() {
        return this.drizzle.db.select().from(bookings);
    }

    async isTimeSlotAvailable(
        barberId: string,
        start: Date,
        end: Date
    ) {
        const result = await this.drizzle.db
            .select()
            .from(bookings)
            .innerJoin(services, eq(bookings.serviceId, services.id))
            .where(
                and(
                    eq(bookings.barberId, barberId),
                    inArray(bookings.status, ["pending", "confirmed"]),
                    lt(bookings.bookingDate, end),
                    sql`${bookings.bookingDate} + interval '1 minute' * ${services.duration} > ${start}`
                )
            );

        return result.length === 0;
    }


    async findBookingsByDate(date: Date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        return this.drizzle.db
            .select({
                id: bookings.id,
                barberId: bookings.barberId,
                serviceId: bookings.serviceId,
                customerUserId: bookings.customerUserId,
                customerName: bookings.customerName,
                customerPhone: bookings.customerPhone,
                customerNote: bookings.customerNote,
                bookingDate: bookings.bookingDate,
                status: bookings.status,
                createdAt: bookings.createdAt,
                updatedAt: bookings.updatedAt,
                duration: services.duration,
            })
            .from(bookings)
            .innerJoin(services, eq(bookings.serviceId, services.id))
            .where(
                and(
                    gte(bookings.bookingDate, start),
                    lt(bookings.bookingDate, end),
                )
            );
    }

    async findBookingsByBarber(barberId: string) {
        return this.drizzle.db
            .select({
                id: bookings.id,
                barberId: bookings.barberId,
                serviceId: bookings.serviceId,
                customerUserId: bookings.customerUserId,
                customerName: bookings.customerName,
                customerPhone: bookings.customerPhone,
                customerNote: bookings.customerNote,
                bookingDate: bookings.bookingDate,
                status: bookings.status,
                createdAt: bookings.createdAt,
                updatedAt: bookings.updatedAt,
                duration: services.duration,
            })
            .from(bookings)
            .innerJoin(services, eq(bookings.serviceId, services.id))
            .where(eq(bookings.barberId, barberId));
    }

    async findBookingsByBarberAndDate(barberId: string, date: Date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        return this.drizzle.db
            .select({
                id: bookings.id,
                barberId: bookings.barberId,

                serviceId: bookings.serviceId,
                serviceName: services.name, // 👈 TAMBAHAN INI

                customerUserId: bookings.customerUserId,
                customerName: bookings.customerName,
                customerPhone: bookings.customerPhone,
                customerNote: bookings.customerNote,

                bookingDate: bookings.bookingDate,
                status: bookings.status,

                duration: services.duration,

                createdAt: bookings.createdAt,
                updatedAt: bookings.updatedAt,
            })
            .from(bookings)
            .innerJoin(services, eq(bookings.serviceId, services.id))
            .where(
                and(
                    eq(bookings.barberId, barberId),
                    gte(bookings.bookingDate, start),
                    lt(bookings.bookingDate, end),
                )
            )
            .orderBy(bookings.bookingDate);
    }


    async updateStatus(
        bookingId: string,
        status: "pending" | "completed" | "cancelled",
    ) {
        return this.drizzle.db
            .update(bookings)
            .set({
                status,
                updatedAt: new Date(),
            })
            .where(eq(bookings.id, bookingId))
            .returning();
    }

}

