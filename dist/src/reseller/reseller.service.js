"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResellerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../products/entities/product.entity");
const sale_invoice_item_entity_1 = require("../sale-invoice/entities/sale-invoice-item.entity");
const reseller_payout_entity_1 = require("./entities/reseller-payout.entity");
const systemuser_entity_1 = require("../systemuser/entities/systemuser.entity");
const system_user_role_enum_1 = require("../systemuser/system-user-role.enum");
let ResellerService = class ResellerService {
    constructor(productRepo, saleItemRepo, payoutRepo, systemUserRepo) {
        this.productRepo = productRepo;
        this.saleItemRepo = saleItemRepo;
        this.payoutRepo = payoutRepo;
        this.systemUserRepo = systemUserRepo;
    }
    async getSummary(resellerId, companyId) {
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
            .getRawOne();
        const totalSoldQty = Number(salesAgg?.totalSoldQty ?? 0);
        const totalEarning = Number(salesAgg?.totalEarning ?? 0);
        const paidPayouts = await this.payoutRepo
            .createQueryBuilder('payout')
            .select('COALESCE(SUM(payout.amount), 0)', 'paid')
            .where('payout.resellerId = :resellerId', { resellerId })
            .andWhere('payout.companyId = :companyId', { companyId })
            .andWhere('payout.status = :status', {
            status: reseller_payout_entity_1.ResellerPayoutStatus.PAID,
        })
            .getRawOne();
        const totalPaid = Number(paidPayouts?.paid ?? 0);
        const pendingPayoutAmount = Math.max(totalEarning - totalPaid, 0);
        return {
            totalProducts,
            totalSoldQty,
            totalEarning,
            pendingPayoutAmount,
        };
    }
    async listPayouts(resellerId, companyId) {
        return this.payoutRepo.find({
            where: { resellerId, companyId },
            order: { createdAt: 'DESC' },
        });
    }
    async requestPayout(resellerId, companyId) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recent = await this.payoutRepo.findOne({
            where: {
                resellerId,
                companyId,
                createdAt: (0, typeorm_2.MoreThanOrEqual)(sevenDaysAgo),
            },
            order: { createdAt: 'DESC' },
        });
        if (recent) {
            throw new common_1.BadRequestException('Payment request allowed once every 7 days.');
        }
        const summary = await this.getSummary(resellerId, companyId);
        if (summary.pendingPayoutAmount <= 0) {
            throw new common_1.BadRequestException('No payable amount available.');
        }
        const payout = this.payoutRepo.create({
            resellerId,
            companyId,
            amount: summary.pendingPayoutAmount,
            status: reseller_payout_entity_1.ResellerPayoutStatus.PENDING,
        });
        return this.payoutRepo.save(payout);
    }
    async adminListPayouts(companyId) {
        const qb = this.payoutRepo
            .createQueryBuilder('payout')
            .orderBy('payout.createdAt', 'DESC');
        if (companyId) {
            qb.where('payout.companyId = :companyId', { companyId });
        }
        return qb.getMany();
    }
    async markPayoutPaid(id) {
        const payout = await this.payoutRepo.findOne({ where: { id } });
        if (!payout) {
            throw new common_1.BadRequestException('Payout not found');
        }
        payout.status = reseller_payout_entity_1.ResellerPayoutStatus.PAID;
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
    async getPayoutInvoice(payoutId, resellerId, companyId) {
        const payout = await this.payoutRepo.findOne({
            where: { id: payoutId, resellerId, companyId },
        });
        if (!payout) {
            throw new common_1.BadRequestException('Payout not found');
        }
        if (payout.status !== reseller_payout_entity_1.ResellerPayoutStatus.PAID) {
            throw new common_1.BadRequestException('Invoice is available only for paid payouts');
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
    async adminResellersList(companyId) {
        const qb = this.systemUserRepo
            .createQueryBuilder('u')
            .where('u.role = :role', { role: system_user_role_enum_1.SystemUserRole.RESELLER })
            .orderBy('u.name', 'ASC');
        if (companyId) {
            qb.andWhere('u.companyId = :companyId', { companyId });
        }
        const resellers = await qb.getMany();
        const result = await Promise.all(resellers.map(async (u) => {
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
        }));
        return result;
    }
};
exports.ResellerService = ResellerService;
exports.ResellerService = ResellerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.ProductEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(sale_invoice_item_entity_1.SaleInvoiceItem)),
    __param(2, (0, typeorm_1.InjectRepository)(reseller_payout_entity_1.ResellerPayout)),
    __param(3, (0, typeorm_1.InjectRepository)(systemuser_entity_1.SystemUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ResellerService);
//# sourceMappingURL=reseller.service.js.map