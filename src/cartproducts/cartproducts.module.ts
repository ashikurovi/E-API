import { Module } from '@nestjs/common';
import { CartproductsService } from './cartproducts.service';
import { CartproductsController } from './cartproducts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cartproduct } from './entities/cartproduct.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { OrdersModule } from 'src/orders/orders.module';
import { RequestContextService } from 'src/common/services/request-context.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cartproduct, ProductEntity, User]), OrdersModule],
  controllers: [CartproductsController],
  providers: [CartproductsService, RequestContextService],
})
export class CartproductsModule {}
