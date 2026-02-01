import { Controller, Post, Body, UseGuards, Get, Request, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import type { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) { }

  @Post("login")
  login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.auth.login(body.email, body.password, res);
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
      sameSite: "strict",
      secure: true, // true kalau https
      path: "/",
    });

    return { message: "Logged out" };
  }

}
