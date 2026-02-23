import { HttpStatus } from '@nestjs/common';
import { ResellerService } from './reseller.service';
export declare class ResellerController {
    private readonly resellerService;
    constructor(resellerService: ResellerService);
    getSummary(companyId: string, req: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        statusCode: HttpStatus;
        data: {
            totalProducts: number;
            totalSoldQty: number;
            totalEarning: number;
            pendingPayoutAmount: number;
        };
        message?: undefined;
    }>;
    listPayouts(companyId: string, req: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        statusCode: HttpStatus;
        data: import("./entities/reseller-payout.entity").ResellerPayout[];
        message?: undefined;
    }>;
    getPayoutInvoice(id: number, companyId: string, req: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        statusCode: HttpStatus;
        data: {
            invoiceNumber: string;
            resellerName: string;
            resellerEmail: string;
            companyName: string;
            amount: number;
            paidAt: Date;
            requestedAt: Date;
            payoutId: number;
        };
        message?: undefined;
    }>;
    requestPayout(companyId: string, req: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/reseller-payout.entity").ResellerPayout;
    }>;
    adminResellersList(companyId: string, req: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        statusCode: HttpStatus;
        data: {
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
            payouts: import("./entities/reseller-payout.entity").ResellerPayout[];
        }[];
        message?: undefined;
    }>;
    adminListPayouts(companyId: string, req: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        statusCode: HttpStatus;
        data: import("./entities/reseller-payout.entity").ResellerPayout[];
        message?: undefined;
    }>;
    markPayoutPaid(id: number, req: any): Promise<{
        statusCode: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        statusCode: HttpStatus;
        message: string;
        data: import("./entities/reseller-payout.entity").ResellerPayout;
    }>;
}
