import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ServicesService } from "./services.service";
import { CreateServiceDto } from "./dto/create-services.dto";
import { UpdateServiceDto } from "./dto/update-services.dto";
// import { CreateServiceDto } from "./dto/create-service.dto";
// import { UpdateServiceDto } from "./dto/update-service.dto";

@Controller("services")
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateServiceDto
  ) {
    return this.service.update(id, dto);
  }

  @Patch(":id/toggle-active")
  toggleActive(@Param("id") id: string) {
    return this.service.toggleActive(id);
  }
}
