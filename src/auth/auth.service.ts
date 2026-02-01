import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { Response } from "express";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { UsersRepository } from "src/users/users.repository";

@Injectable()
export class AuthService {
  constructor(
    private usersRepo: UsersRepository,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string, res: Response) {
    const user = await this.usersRepo.findByEmail(email);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    const token = this.jwt.sign({
      sub: user.id,
      role: user.role,
    });

    res.cookie("access_token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: true, // true kalau https
      path: "/",
    });

    return { success: true };
  }
}
