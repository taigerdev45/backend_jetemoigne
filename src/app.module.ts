import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { PublicHubModule } from './public-hub/public-hub.module';
import { ProgramsModule } from './programs/programs.module';
import { TestimoniesModule } from './testimonies/testimonies.module';
import { ProjectsModule } from './projects/projects.module';
import { LibraryModule } from './library/library.module';
import { AdsModule } from './ads/ads.module';
import { SupportModule } from './support/support.module';

@Module({
  imports: [AuthModule, PrismaModule, PublicHubModule, ProgramsModule, TestimoniesModule, ProjectsModule, LibraryModule, AdsModule, SupportModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
