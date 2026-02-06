import { Controller, Post, Body, UseGuards, Get, Request, Req, Res, UseInterceptors,  } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import type { Response } from "express";
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'; // Tambah ini

@Controller("auth")
@UseGuards(ThrottlerGuard) // Rate limiting global
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post("login")
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute for login
  login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.login(body.email, body.password, res);
  }

  @Post("refresh")
  refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    return this.auth.refresh(req.cookies["refresh_token"], res);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req) {
    const user = req.user;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("access_token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: "/",
      partitioned: process.env.NODE_ENV === 'production',
    });
    res.clearCookie("refresh_token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: "/",
      partitioned: process.env.NODE_ENV === 'production',
    });
    return { message: "Logged out" };
  }
}