import { Controller, Get, Post, Body, Query, Patch, Param } from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";

@Controller("bookings")
export class BookingsController {
    constructor(private readonly service: BookingsService) { }

    @Post()
    create(@Body() dto: CreateBookingDto) {
        return this.service.createBooking(dto);
    }

    @Get()
    findAll() {
        return this.service.getBookings();
    }

    @Get("by-barber")
    getBookingsByBarber(@Query("barberId") barberId: string) {
        return this.service.getBookingsByBarber(barberId);
    }

    @Get("barber")
    getBarberBookingsByDate(
        @Query("date") date: string,
        @Query("barberId") barberId: string,
    ) {
        return this.service.getBarberBookingsByDate(date, barberId);
    }

    @Patch(":id/status")
    updateStatus(
        @Param("id") id: string,
        @Body("status") status: "pending" | "completed" | "cancelled",
    ) {
        return this.service.updateBookingStatus(id, status);
    }


    @Get("available-slots")
    getAvailableSlots(
        @Query("date") date: string,
        @Query("barberId") barberId: string,
    ) {
        return this.service.getAvailableSlots(date, barberId);
    }

}
