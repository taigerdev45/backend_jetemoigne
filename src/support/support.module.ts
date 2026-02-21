import { Module } from '@nestjs/common';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PrismaModule, StorageModule, NotificationsModule, PaymentModule],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule { }
