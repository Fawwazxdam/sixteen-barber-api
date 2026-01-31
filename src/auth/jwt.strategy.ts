import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { UsersRepository } from "src/users/users.repository";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersRepo: UsersRepository) {
        super({
            jwtFromRequest: (req: Request) => {
                if (!req || !req.cookies) return null;
                return req.cookies["access_token"]; // 🔥 INI KUNCI
            },
            secretOrKey: process.env.JWT_SECRET,
        });
    }

    async validate(payload: { sub: string; role: string }) {
        const user = await this.usersRepo.findById(payload.sub);

        if (!user) {
            throw new UnauthorizedException();
        }

        return user; // ⬅️ masuk ke req.user
    }
}
