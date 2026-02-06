import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  // ✅ Rate limiting: max 5 login attempts per menit
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post("login")
  @HttpCode(HttpStatus.OK)
  login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    return this.auth.login(body.email, body.password, res);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: Request) {
    const user = req.user as any;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  // ✅ Endpoint untuk refresh access token
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies["refresh_token"];
    console.log('[REFRESH] Cookie refresh_token received:', refreshToken);
    console.log('[REFRESH] All cookies:', JSON.stringify(req.cookies));
    return this.auth.refreshAccessToken(refreshToken, res);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies["refresh_token"];
    return this.auth.logout(refreshToken, res);
  }
}