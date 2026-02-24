import { Module } from '@nestjs/common';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
  imports: [PrismaModule, PaymentModule],
  controllers: [AdsController],
  providers: [AdsService],
})
export class AdsModule { }
