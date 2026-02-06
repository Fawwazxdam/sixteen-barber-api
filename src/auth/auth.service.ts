import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import type { Response } from "express";
import * as argon2 from "argon2";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { UsersRepository } from "src/users/users.repository";
import { DrizzleService } from "src/drizzle/drizzle.service";
import { refreshTokens } from "src/db/schema";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersRepo: UsersRepository,
    private jwt: JwtService,
    private drizzle: DrizzleService,
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

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie("access_token", token, {
      httpOnly: true, // WAJIB: JS Frontend tidak boleh baca ini
      path: "/",
      // Jika localhost (dev), gunakan false agar cookie diterima browser http biasa
      secure: isProduction, 
      // Jika localhost, gunakan 'lax'. Jika beda domain (prod), gunakan 'none'
      sameSite: isProduction ? 'none' : 'lax', 
      partitioned: isProduction,
      maxAge: 24 * 60 * 60 * 1000, // 1 hari
    });

    // JANGAN kirim token di body! Cukup status sukses.
    return { success: true, message: "Login successful" };
  }

  async refreshAccessToken(refreshToken: string, res: Response) {
    this.logger.log('[REFRESH] Attempting to refresh access token');
    
    // Get refresh token from database
    const tokenData = await this.drizzle.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken))
      .limit(1);

    if (!tokenData.length || tokenData[0].expiresAt < new Date()) {
      this.logger.warn('[REFRESH] Invalid or expired refresh token');
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const tokenRecord = tokenData[0];
    const user = await this.usersRepo.findById(tokenRecord.userId);
    if (!user) {
      this.logger.error(`[REFRESH] User not found: ${tokenRecord.userId}`);
      throw new UnauthorizedException("User not found");
    }

    // Generate new access token
    const newAccessToken = this.jwt.sign(
      {
        sub: user.id,
        role: user.role,
      },
      { expiresIn: "15m" }
    );

    const isProduction = process.env.NODE_ENV === "production";
    
    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    this.logger.log(`[REFRESH] Token refreshed for user: ${user.id}`);

    return { success: true };
  }

  async logout(refreshToken: string | undefined, res: Response) {
    this.logger.log('[LOGOUT] Logging out user');
    
    // Delete refresh token from database
    if (refreshToken) {
      await this.drizzle.db
        .delete(refreshTokens)
        .where(eq(refreshTokens.token, refreshToken));
    }

    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("access_token", {
      httpOnly: true,
      sameSite: "none",
      secure: isProduction,
      path: "/",
    });

    res.clearCookie("refresh_token", {
      httpOnly: true,
      sameSite: "none",
      secure: isProduction,
      path: "/",
    });

    this.logger.log('[LOGOUT] Logout successful');

    return { message: "Logged out successfully" };
  }
}
