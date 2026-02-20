import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'change-me-in-prod',
        });
    }

    async validate(payload: any) {
        // Return payload with userId, companyId, permissions, and role
        return {
            userId: payload.userId || payload.sub,
            companyId: payload.companyId,
            email: payload.email,
            permissions: payload.permissions || [],
            role: payload.role,
        };
    }
}


