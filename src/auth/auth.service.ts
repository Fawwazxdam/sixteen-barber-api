import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersRepository } from "../users/users.repository";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private usersRepo: UsersRepository,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersRepo.findByEmail(email);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    return {
      accessToken: this.jwt.sign({
        sub: user.id,
        role: user.role,
      }),
    };
  }
}
