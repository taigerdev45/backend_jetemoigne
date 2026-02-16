import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdsService {
    constructor(private prisma: PrismaService) { }

    async findActive() {
        return this.prisma.ad.findMany({
            where: {
                isActive: true,
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async recordClick(id: string) {
        return this.prisma.ad.update({
            where: { id },
            data: {
                clicksCount: {
                    increment: 1,
                },
            },
        });
    }

    async recordView(id: string) {
        return this.prisma.ad.update({
            where: { id },
            data: {
                viewsCount: {
                    increment: 1,
                },
            },
        });
    }
}
