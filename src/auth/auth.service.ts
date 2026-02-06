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

    const accessToken = this.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: "15m" } // Access token pendek
    );
    const refreshToken = this.jwt.sign(
      { sub: user.id },
      { expiresIn: "7d" } // Refresh token panjang
    );

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: "/",
      partitioned: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 menit
    });
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: "/",
      partitioned: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    return { success: true };
  }

  async refresh(refreshToken: string, res: Response) {
    if (!refreshToken) throw new UnauthorizedException("No refresh token");

    try {
      const payload = this.jwt.verify(refreshToken, { secret: process.env.JWT_SECRET });
      const user = await this.usersRepo.findById(payload.sub);
      if (!user) throw new UnauthorizedException();

      const newAccessToken = this.jwt.sign(
        { sub: user.id, role: user.role },
        { expiresIn: "15m" }
      );

      res.cookie("access_token", newAccessToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: "/",
        partitioned: process.env.NODE_ENV === 'production',
        maxAge: 15 * 60 * 1000,
      });

      return { success: true };
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }
}