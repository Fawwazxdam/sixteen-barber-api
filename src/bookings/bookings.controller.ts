import { Controller, Get, Post, Body, Query } from "@nestjs/common";
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

    @Get("available-slots")
    getAvailableSlots(
        @Query("date") date: string,
        @Query("barberId") barberId: string,
    ) {
        return this.service.getAvailableSlots(date, barberId);
    }

}
