import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { UsersRepository } from "../users/users.repository";
import { DrizzleModule } from "../drizzle/drizzle.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RolesGuard } from "./roles.guard";
import { UsersModule } from "src/users/users.module";
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    DrizzleModule,
    UsersModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([{
        ttl: config.get('THROTTLE_TTL') || 60000,
        limit: config.get('THROTTLE_LIMIT') || 100,
      }]),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: "15m" },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersRepository, RolesGuard],
})
export class AuthModule {}
