import { BadRequestException, Injectable } from "@nestjs/common";
import { BookingsRepository } from "./bookings.repository";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { calculateEndTime, isWithinOperatingHours } from "./bookings.utils";
import { generateTimeSlots } from "./slot.utils";
// import { calculateEndTime, isWithinOperatingHours } from "./booking.utils";

@Injectable()
export class BookingsService {
    constructor(private readonly repo: BookingsRepository) { }

    async createBooking(dto: CreateBookingDto) {
        const start = new Date(dto.bookingTime);
        const end = calculateEndTime(start, dto.duration);

        if (!isWithinOperatingHours(start) || !isWithinOperatingHours(end)) {
            throw new BadRequestException("Di luar jam operasional");
        }

        const available = await this.repo.isTimeSlotAvailable(dto.barberId, start, end);
        if (!available) {
            throw new BadRequestException("Jadwal sudah dibooking");
        }

        return this.repo.create({
            barberId: dto.barberId,
            serviceId: dto.serviceId,
            customerUserId: dto.customerUserId,
            customerName: dto.customerName,
            customerPhone: dto.customerPhone,
            customerNote: dto.customerNote,
            bookingDate: start,
        });
    }

    getBookings() {
        return this.repo.findAll();
    }

    async getAvailableSlots(dateStr: string, barberId: string) {
        const date = new Date(dateStr);

        const allSlots = generateTimeSlots(date);
        const bookings = await this.repo.findBookingsByDate(date);

        const available = allSlots.filter(slot => {
            return !bookings.some(booking => {
                if (!["pending", "confirmed"].includes(booking.status)) return false;

                const bookingEnd = new Date(booking.bookingDate);
                bookingEnd.setMinutes(bookingEnd.getMinutes() + booking.duration);

                return slot.start < bookingEnd && slot.end > booking.bookingDate;
            });
        });

        return available.map(slot => ({
            start: slot.start,
            end: slot.end,
        }));
    }
}
