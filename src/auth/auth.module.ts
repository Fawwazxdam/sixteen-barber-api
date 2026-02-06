import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ThrottlerModule } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { UsersRepository } from "../users/users.repository";
import { DrizzleModule } from "../drizzle/drizzle.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RolesGuard } from "./roles.guard";
import { UsersModule } from "src/users/users.module";

@Module({
  imports: [
    DrizzleModule,
    UsersModule,
    // ✅ Rate limiting configuration
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 menit
        limit: 10, // max 10 requests per menit (global)
      },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: "15m" }, // ✅ Short-lived access token
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersRepository, RolesGuard],
})
export class AuthModule {}