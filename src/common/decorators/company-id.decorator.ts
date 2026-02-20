import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract companyId from request object.
 * Usage: @CompanyId() companyId: string
 */
export const CompanyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.companyId || request.user?.companyId;
  },
);


