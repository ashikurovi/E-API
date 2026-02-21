import { ProductEntity } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
export declare class Review {
    id: number;
    product: ProductEntity;
    user?: User;
    rating: number;
    title?: string;
    comment: string;
    reply?: string;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
