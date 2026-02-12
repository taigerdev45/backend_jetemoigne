import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PublicHubService {
    constructor(private prisma: PrismaService) { }

    async getHomeData() {
        // Proactive aggregation of all home page components
        const [
            featuredPrograms,
            latestNews,
            activeAds,
            urgentProjects,
            latestTestimonies,
            newBooks,
            liveInfo,
        ] = await Promise.all([
            // Top 5 featured programs
            (this.prisma as any).program.findMany({
                where: { isFeatured: true },
                take: 5,
                orderBy: { publishedAt: 'desc' },
            }),
            // Latest 4 news (category info)
            (this.prisma as any).program.findMany({
                where: { category: 'info' },
                take: 4,
                orderBy: { publishedAt: 'desc' },
            }),
            // Active advertisements
            (this.prisma as any).ad.findMany({
                where: { isActive: true },
                take: 3,
            }),
            // Urgent projects (latest 2)
            (this.prisma as any).project.findMany({
                take: 2,
                orderBy: { createdAt: 'desc' },
                include: { milestones: true },
            }),
            // Latest 3 validated testimonies
            (this.prisma as any).testimony.findMany({
                where: { status: 'valide' },
                take: 3,
                orderBy: { createdAt: 'desc' },
            }),
            // Latest 4 books
            (this.prisma as any).book.findMany({
                take: 4,
                orderBy: { createdAt: 'desc' },
            }),
            // Current live info
            (this.prisma as any).program.findFirst({
                where: { isLive: true },
            }),
        ]);

        return {
            featuredPrograms,
            latestNews,
            activeAds,
            urgentProjects,
            latestTestimonies,
            newBooks,
            liveInfo,
        };
    }

    async getGlobalStats() {
        const [donorsCount, volunteersCount, testimoniesCount] = await Promise.all([
            (this.prisma as any).transaction.count({
                where: { status: 'verifie' },
            }),
            (this.prisma as any).volunteer.count({
                where: { status: 'actif' },
            }),
            (this.prisma as any).testimony.count({
                where: { status: 'valide' },
            }),
        ]);

        return {
            donorsCount,
            volunteersCount,
            testimoniesCount,
        };
    }

    async getSettings() {
        return (this.prisma as any).appSettings.findFirst({
            where: { id: 1 },
        });
    }
}
