import { Module } from '@nestjs/common';
import { ProductService } from './products.service';
import { ProductController } from './products.controller';
import { PublicProductController } from './public-products.controller';
import { ProductsSchedulerService } from './products-scheduler.service';
import { ImageSearchService } from './image-search.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { CategoryEntity } from 'src/category/entities/category.entity';
import { Order } from 'src/orders/entities/order.entity';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionGuard } from 'src/common/guards/permission.guard';
import { SystemuserModule } from 'src/systemuser/systemuser.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { DashboardModule } from 'src/dashboard/dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductEntity, CategoryEntity, Order]),
    SystemuserModule,
    NotificationsModule,
    DashboardModule,
  ],
  controllers: [ProductController, PublicProductController],
  providers: [ProductService, ProductsSchedulerService, ImageSearchService, JwtAuthGuard, PermissionGuard],
})
export class ProductModule { }
