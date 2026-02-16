import { Module } from '@nestjs/common';
import { AdminHubController } from './admin-hub.controller';
import { AdminHubService } from './admin-hub.service';
import { AdminTestimoniesController } from './admin-testimonies.controller';
import { AdminFinancesController } from './admin-finances.controller';
import { AdminTeamController } from './admin-team.controller';
import { AdminContentController } from './admin-content.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, StorageModule, NotificationsModule],
  controllers: [
    AdminHubController,
    AdminTestimoniesController,
    AdminFinancesController,
    AdminTeamController,
    AdminContentController,
  ],
  providers: [AdminHubService]
})
export class AdminHubModule { }
