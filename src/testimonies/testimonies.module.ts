import { Module } from '@nestjs/common';
import { TestimoniesController } from './testimonies.controller';
import { TestimoniesService } from './testimonies.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TestimoniesController],
  providers: [TestimoniesService],
})
export class TestimoniesModule { }
