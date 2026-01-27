import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateBarberDto } from "./dto/create-barber.dto";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { UpdateBarberDto } from "./dto/update-barber.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post("barbers")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  async createBarber(@Body() dto: CreateBarberDto) {
    return this.usersService.createBarber(dto);
  }

  @Get("barbers")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  getBarbers() {
    return this.usersService.getBarbers();
  }

  @Patch("barbers/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  updateBarber(
    @Param("id") id: string,
    @Body() dto: UpdateBarberDto
  ) {
    return this.usersService.updateBarber(id, dto);
  }
}
