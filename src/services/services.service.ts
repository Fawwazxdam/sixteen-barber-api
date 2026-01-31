import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ServicesRepository } from "./services.repository";
import { CreateServiceDto } from "./dto/create-services.dto";
import { UpdateServiceDto } from "./dto/update-services.dto";
// import { CreateServiceDto } from "./dto/create-service.dto";
// import { UpdateServiceDto } from "./dto/update-service.dto";

@Injectable()
export class ServicesService {
  constructor(private readonly repo: ServicesRepository) {}

  async create(dto: CreateServiceDto) {
    return this.repo.create(dto);
  }

  async findAll() {
    return this.repo.findAll();
  }

  async update(id: string, dto: UpdateServiceDto) {
    const service = await this.repo.findById(id);
    if (!service.length) {
      throw new NotFoundException("Service tidak ditemukan");
    }

    return this.repo.update(id, dto);
  }

  async toggleActive(id: string) {
    const service = await this.repo.findById(id);
    if (!service.length) {
      throw new NotFoundException("Service tidak ditemukan");
    }

    return this.repo.update(id, {
      isActive: !service[0].isActive,
    });
  }

  async delete(id: string) {
    const service = await this.repo.findById(id);
    if (!service.length) {
      throw new NotFoundException("Service tidak ditemukan");
    }

    return this.repo.delete(id);
  }
}
