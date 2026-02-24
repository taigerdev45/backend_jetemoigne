import { Module } from '@nestjs/common';
import { PublicHubController } from './public-hub.controller';
import { PublicHubService } from './public-hub.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PublicHubController],
  providers: [PublicHubService],
})
export class PublicHubModule {}
