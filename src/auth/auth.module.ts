import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { UsersRepository } from "../users/users.repository";
import { DrizzleModule } from "../drizzle/drizzle.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RolesGuard } from "./roles.guard";

@Module({
  imports: [
    DrizzleModule, // ⬅️ INI KUNCI
    JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: "1d" },
        })
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, UsersRepository, RolesGuard],
})
export class AuthModule {}
