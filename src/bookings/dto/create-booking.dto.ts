import { IsString, IsDateString, IsInt, Min, IsOptional } from "class-validator";

export class CreateBookingDto {
  @IsString()
  barberId: string;

  @IsString()
  serviceId: string;

  @IsOptional()
  @IsString()
  customerUserId?: string;

  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsOptional()
  @IsString()
  customerNote?: string;

  @IsDateString()
  bookingTime: string;

  @IsInt()
  @Min(30)
  duration: number;
}
