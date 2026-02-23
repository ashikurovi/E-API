import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { ProductEntity } from '../products/entities/product.entity';
import { SaleInvoiceItem } from '../sale-invoice/entities/sale-invoice-item.entity';
import {
  ResellerPayout,
  ResellerPayoutStatus,
} from './entities/reseller-payout.entity';
import { SystemUser } from '../systemuser/entities/systemuser.entity';
import { SystemUserRole } from '../systemuser/system-user-role.enum';

@Injectable()
export class ResellerService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(SaleInvoiceItem)
    private readonly saleItemRepo: Repository<SaleInvoiceItem>,
    @InjectRepository(ResellerPayout)
    private readonly payoutRepo: Repository<ResellerPayout>,
    @InjectRepository(SystemUser)
    private readonly systemUserRepo: Repository<SystemUser>,
  ) {}

  async getSummary(resellerId: number, companyId: string) {
    const totalProducts = await this.productRepo.count({
      where: { resellerId, companyId },
    });

    const salesAgg = await this.saleItemRepo
      .createQueryBuilder('item')
      .leftJoin('item.product', 'product')
      .select('COALESCE(SUM(item.quantity), 0)', 'totalSoldQty')
      .addSelect('COALESCE(SUM(item.amount), 0)', 'totalEarning')
      .where('product.resellerId = :resellerId', { resellerId })
      .andWhere('product.companyId = :companyId', { companyId })
      .getRawOne<{ totalSoldQty: string; totalEarning: string }>();

    const totalSoldQty = Number(salesAgg?.totalSoldQty ?? 0);
    const totalEarning = Number(salesAgg?.totalEarning ?? 0);

    const paidPayouts = await this.payoutRepo
      .createQueryBuilder('payout')
      .select('COALESCE(SUM(payout.amount), 0)', 'paid')
      .where('payout.resellerId = :resellerId', { resellerId })
      .andWhere('payout.companyId = :companyId', { companyId })
      .andWhere('payout.status = :status', {
        status: ResellerPayoutStatus.PAID,
      })
      .getRawOne<{ paid: string }>();

    const totalPaid = Number(paidPayouts?.paid ?? 0);
    const pendingPayoutAmount = Math.max(totalEarning - totalPaid, 0);

    return {
      totalProducts,
      totalSoldQty,
      totalEarning,
      pendingPayoutAmount,
    };
  }

  async listPayouts(resellerId: number, companyId: string) {
    return this.payoutRepo.find({
      where: { resellerId, companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async requestPayout(resellerId: number, companyId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recent = await this.payoutRepo.findOne({
      where: {
        resellerId,
        companyId,
        createdAt: MoreThanOrEqual(sevenDaysAgo),
      },
      order: { createdAt: 'DESC' },
    });

    if (recent) {
      throw new BadRequestException(
        'Payment request allowed once every 7 days.',
      );
    }

    const summary = await this.getSummary(resellerId, companyId);
    if (summary.pendingPayoutAmount <= 0) {
      throw new BadRequestException('No payable amount available.');
    }

    const payout = this.payoutRepo.create({
      resellerId,
      companyId,
      amount: summary.pendingPayoutAmount,
      status: ResellerPayoutStatus.PENDING,
    });

    return this.payoutRepo.save(payout);
  }

  async adminListPayouts(companyId?: string) {
    const qb = this.payoutRepo
      .createQueryBuilder('payout')
      .orderBy('payout.createdAt', 'DESC');

    if (companyId) {
      qb.where('payout.companyId = :companyId', { companyId });
    }

    return qb.getMany();
  }

  async markPayoutPaid(id: number) {
    const payout = await this.payoutRepo.findOne({ where: { id } });
    if (!payout) {
      throw new BadRequestException('Payout not found');
    }
    payout.status = ResellerPayoutStatus.PAID;
    payout.paidAt = new Date();
    if (!payout.invoiceNumber) {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      payout.invoiceNumber = `RP-INV-${payout.companyId}-${id}-${yyyy}${mm}${dd}`;
    }
    return this.payoutRepo.save(payout);
  }

  /** Reseller: get invoice data for a paid payout (own payouts only) */
  async getPayoutInvoice(
    payoutId: number,
    resellerId: number,
    companyId: string,
  ) {
    const payout = await this.payoutRepo.findOne({
      where: { id: payoutId, resellerId, companyId },
    });
    if (!payout) {
      throw new BadRequestException('Payout not found');
    }
    if (payout.status !== ResellerPayoutStatus.PAID) {
      throw new BadRequestException('Invoice is available only for paid payouts');
    }
    const reseller = await this.systemUserRepo.findOne({
      where: { id: resellerId },
    });
    return {
      invoiceNumber: payout.invoiceNumber ?? `RP-INV-${payout.id}`,
      resellerName: reseller?.name ?? 'Reseller',
      resellerEmail: reseller?.email ?? '',
      companyName: reseller?.companyName ?? '',
      amount: Number(payout.amount),
      paidAt: payout.paidAt,
      requestedAt: payout.createdAt,
      payoutId: payout.id,
    };
  }

  /** Admin: list all resellers for company with stats and payout requests */
  async adminResellersList(companyId?: string) {
    const qb = this.systemUserRepo
      .createQueryBuilder('u')
      .where('u.role = :role', { role: SystemUserRole.RESELLER })
      .orderBy('u.name', 'ASC');

    if (companyId) {
      qb.andWhere('u.companyId = :companyId', { companyId });
    }

    const resellers = await qb.getMany();

    const result = await Promise.all(
      resellers.map(async (u) => {
        const summary = await this.getSummary(u.id, u.companyId);
        const payouts = await this.listPayouts(u.id, u.companyId);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone ?? null,
          companyId: u.companyId,
          companyName: u.companyName ?? null,
          totalProducts: summary.totalProducts,
          totalSoldQty: summary.totalSoldQty,
          totalEarning: summary.totalEarning,
          pendingPayoutAmount: summary.pendingPayoutAmount,
          payouts,
        };
      }),
    );

    return result;
  }
}

