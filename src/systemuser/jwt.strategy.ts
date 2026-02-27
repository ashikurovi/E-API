import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SystemuserService } from './systemuser.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly systemuserService: SystemuserService,
    private readonly usersService: UsersService,
  ) {
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
      // First, try to validate as a system user (admin/dashboard user)
      const systemUser = await this.systemuserService.findOne(Number(userId));
      if (systemUser && systemUser.isActive) {
        return {
          userId: systemUser.id,
          companyId: systemUser.companyId,
          email: systemUser.email,
          permissions: systemUser.permissions || [],
          role: systemUser.role,
        };
      }
    } catch {
      // Fall through to try customer user below
    }

    // If not a valid system user, try to validate as a storefront customer
    try {
      const companyId = payload.companyId;
      if (!companyId) {
        return null;
      }

      const customer = await this.usersService.findOne(Number(userId), companyId);
      if (!customer || !customer.isActive || customer.isBanned) {
        return null;
      }

      return {
        userId: customer.id,
        companyId: customer.companyId,
        email: customer.email,
        role: customer.role ?? 'customer',
      };
    } catch {
      // If neither system user nor customer lookup succeeds, treat token as invalid
      return null;
    }
  }
}


