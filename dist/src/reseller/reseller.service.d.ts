import { Repository } from 'typeorm';
import { ProductEntity } from '../products/entities/product.entity';
import { SaleInvoiceItem } from '../sale-invoice/entities/sale-invoice-item.entity';
import { ResellerPayout } from './entities/reseller-payout.entity';
import { SystemUser } from '../systemuser/entities/systemuser.entity';
export declare class ResellerService {
    private readonly productRepo;
    private readonly saleItemRepo;
    private readonly payoutRepo;
    private readonly systemUserRepo;
    constructor(productRepo: Repository<ProductEntity>, saleItemRepo: Repository<SaleInvoiceItem>, payoutRepo: Repository<ResellerPayout>, systemUserRepo: Repository<SystemUser>);
    getSummary(resellerId: number, companyId: string): Promise<{
        totalProducts: number;
        totalSoldQty: number;
        totalEarning: number;
        pendingPayoutAmount: number;
    }>;
    listPayouts(resellerId: number, companyId: string): Promise<ResellerPayout[]>;
    requestPayout(resellerId: number, companyId: string): Promise<ResellerPayout>;
    adminListPayouts(companyId?: string): Promise<ResellerPayout[]>;
    markPayoutPaid(id: number): Promise<ResellerPayout>;
    getPayoutInvoice(payoutId: number, resellerId: number, companyId: string): Promise<{
        invoiceNumber: string;
        resellerName: string;
        resellerEmail: string;
        companyName: string;
        amount: number;
        paidAt: Date;
        requestedAt: Date;
        payoutId: number;
    }>;
    adminResellersList(companyId?: string): Promise<{
        id: number;
        name: string;
        email: string;
        phone: string;
        companyId: string;
        companyName: string;
        totalProducts: number;
        totalSoldQty: number;
        totalEarning: number;
        pendingPayoutAmount: number;
        payouts: ResellerPayout[];
    }[]>;
}
