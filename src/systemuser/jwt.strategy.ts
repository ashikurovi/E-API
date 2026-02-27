import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SystemuserService } from './systemuser.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly systemuserService: SystemuserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'change-me-in-prod',
    });
  }

  async validate(payload: any) {
    const userId = payload.userId || payload.sub;
    if (!userId) {
      return null;
    }

    try {
      // Always check latest user state from DB so inactivated users are logged out instantly
      const user = await this.systemuserService.findOne(Number(userId));

      if (!user || !user.isActive) {
        return null;
      }

      return {
        userId: user.id,
        companyId: user.companyId,
        email: user.email,
        permissions: user.permissions || [],
        role: user.role,
      };
    } catch {
      // If the underlying user record no longer exists (or any lookup error happens),
      // treat the token as invalid so JwtAuthGuard returns 401 instead of leaking a 404.
      return null;
    }
  }
}


