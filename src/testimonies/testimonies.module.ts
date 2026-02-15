import { Module } from '@nestjs/common';
import { TestimoniesService } from './testimonies.service';
import { TestimoniesController } from './testimonies.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, StorageModule, NotificationsModule],
  controllers: [TestimoniesController],
  providers: [TestimoniesService],
})
export class TestimoniesModule { }
