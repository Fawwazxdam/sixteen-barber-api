import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { DrizzleService } from "../drizzle/drizzle.service";
import { users } from "../db/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { UsersRepository } from "./users.repository";
import { CreateBarberDto } from "./dto/create-barber.dto";
import { UpdateBarberDto } from "./dto/update-barber.dto";

@Injectable()
export class UsersService {
    constructor(private readonly repo: UsersRepository) { }

    async createBarber(dto: CreateBarberDto) {
        const existing = await this.repo.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException("Email already exists");
        }

        const hashed = await bcrypt.hash(dto.password, 10);

        await this.repo.create({
            email: dto.email,
            name: dto.name,
            password: hashed,
            role: "BARBER",
        });

        return { message: "Barber created" };
    }

    async getBarbers() {
        return this.repo.findBarbers();
    }

    async updateBarber(id: string, dto: UpdateBarberDto) {
        const barber = await this.repo.findBarberById(id);
        if (!barber) {
            throw new NotFoundException("Barber not found");
        }

        const updateData: any = {};

        if (dto.name) {
            updateData.name = dto.name;
        }

        if (dto.password) {
            updateData.password = await bcrypt.hash(dto.password, 10);
        }

        await this.repo.update(id, updateData);

        return { message: "Barber updated" };
    }
}

