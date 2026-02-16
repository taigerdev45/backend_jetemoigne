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
            this.prisma.program.findMany({
                where: { isFeatured: true },
                take: 5,
                orderBy: { publishedAt: 'desc' },
            }),
            // Latest 4 news (category info)
            this.prisma.program.findMany({
                where: { category: 'info' },
                take: 4,
                orderBy: { publishedAt: 'desc' },
            }),
            // Active advertisements
            this.prisma.ad.findMany({
                where: { isActive: true },
                take: 3,
            }),
            // Urgent projects (latest 2)
            this.prisma.project.findMany({
                take: 2,
                orderBy: { createdAt: 'desc' },
                include: { milestones: true },
            }),
            // Latest 3 validated testimonies
            this.prisma.testimony.findMany({
                where: { status: 'valide' },
                take: 3,
                orderBy: { createdAt: 'desc' },
            }),
            // Latest 4 books
            this.prisma.book.findMany({
                take: 4,
                orderBy: { createdAt: 'desc' },
            }),
            // Current live info
            this.prisma.program.findFirst({
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
            this.prisma.transaction.count({
                where: { status: 'verifie' },
            }),
            this.prisma.volunteer.count({
                where: { status: 'actif' },
            }),
            this.prisma.testimony.count({
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
        return this.prisma.appSettings.findFirst({
            where: { id: 1 },
        });
    }
}
