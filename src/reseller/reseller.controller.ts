import {
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { ResellerService } from './reseller.service';
import { SystemUserRole } from '../systemuser/system-user-role.enum';

@Controller('reseller')
@UseGuards(JwtAuthGuard)
export class ResellerController {
  constructor(private readonly resellerService: ResellerService) {}

  @Get('summary')
  async getSummary(@CompanyId() companyId: string, @Req() req: any) {
    const { userId, sub, role } = req.user || {};
    if (role !== SystemUserRole.RESELLER) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Only resellers can access this endpoint',
      };
    }
    const resellerId = +(userId || sub);
    const data = await this.resellerService.getSummary(resellerId, companyId);
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Get('payouts')
  async listPayouts(@CompanyId() companyId: string, @Req() req: any) {
    const { userId, sub, role } = req.user || {};
    if (role !== SystemUserRole.RESELLER) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Only resellers can access this endpoint',
      };
    }
    const resellerId = +(userId || sub);
    const data = await this.resellerService.listPayouts(resellerId, companyId);
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Get('payouts/:id/invoice')
  async getPayoutInvoice(
    @Param('id', ParseIntPipe) id: number,
    @CompanyId() companyId: string,
    @Req() req: any,
  ) {
    const { userId, sub, role } = req.user || {};
    if (role !== SystemUserRole.RESELLER) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Only resellers can access payout invoice',
      };
    }
    const resellerId = +(userId || sub);
    const data = await this.resellerService.getPayoutInvoice(
      id,
      resellerId,
      companyId,
    );
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Post('payouts/request')
  async requestPayout(@CompanyId() companyId: string, @Req() req: any) {
    const { userId, sub, role } = req.user || {};
    if (role !== SystemUserRole.RESELLER) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Only resellers can request payouts',
      };
    }
    const resellerId = +(userId || sub);
    const data = await this.resellerService.requestPayout(
      resellerId,
      companyId,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Payout request created',
      data,
    };
  }

  @Get('admin/resellers')
  async adminResellersList(@CompanyId() companyId: string, @Req() req: any) {
    const { role } = req.user || {};
    if (
      role !== SystemUserRole.SYSTEM_OWNER &&
      role !== SystemUserRole.SUPER_ADMIN
    ) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Only system owners or super admins can view resellers list',
      };
    }
    const data = await this.resellerService.adminResellersList(companyId);
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Get('admin/payouts')
  async adminListPayouts(@CompanyId() companyId: string, @Req() req: any) {
    const { role } = req.user || {};
    if (
      role !== SystemUserRole.SYSTEM_OWNER &&
      role !== SystemUserRole.SUPER_ADMIN
    ) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Only system owners or super admins can view payouts',
      };
    }
    const data = await this.resellerService.adminListPayouts(companyId);
    return {
      statusCode: HttpStatus.OK,
      data,
    };
  }

  @Post('admin/payouts/:id/mark-paid')
  async markPayoutPaid(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const { role } = req.user || {};
    if (
      role !== SystemUserRole.SYSTEM_OWNER &&
      role !== SystemUserRole.SUPER_ADMIN
    ) {
      return {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Only system owners or super admins can mark payouts paid',
      };
    }
    const data = await this.resellerService.markPayoutPaid(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Payout marked as paid',
      data,
    };
  }
}

