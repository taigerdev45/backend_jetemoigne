import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminHubService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const totalVisits = await (this.prisma as any).analyticsDaily.aggregate({
            _sum: { totalVisits: true },
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const donations = await (this.prisma as any).transaction.aggregate({
            where: { transactionType: 'don_financier', status: 'verifie' },
            _sum: { amount: true },
            _count: { id: true },
        });

        // Ratio de validation des témoignages
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const testimoniesCount = await (this.prisma as any).testimony.count();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const pendingTestimonies = await (this.prisma as any).testimony.count({
            where: { status: 'recu' },
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const programsCount = await (this.prisma as any).program.count();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const activeAds = await (this.prisma as any).ad.count({
            where: { isActive: true },
        });

        return {
            audience: {
                totalVisits: totalVisits._sum.totalVisits || 0,
            },
            finances: {
                totalDonations: donations._sum.amount || 0,
                donorsCount: donations._count.id || 0,
            },
            content: {
                totalPrograms: programsCount,
                totalTestimonies: testimoniesCount,
                pendingTestimonies,
                activeAds,
            },
        };
    }

    async getDailyAnalytics() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).analyticsDaily.findMany({
            orderBy: { date: 'desc' },
            take: 30,
        });
    }

    // ADVANCED ANALYTICS
    async getFinanceAnalytics() {
        // Revenus mensuels des 6 derniers mois
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const monthlyRevenue = await (this.prisma as any).transaction.groupBy({
            by: ['createdAt'],
            where: {
                transactionType: 'don_financier',
                status: 'verifie',
                createdAt: { gte: sixMonthsAgo },
            },
            _sum: { amount: true },
        });

        // Répartition par projet
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const revenueByProject = await (this.prisma as any).transaction.groupBy({
            by: ['projectId'],
            where: {
                transactionType: 'don_financier',
                status: 'verifie',
            },
            _sum: { amount: true },
        });

        return {
            monthlyRevenue, // Note: Grouping by exact timestamp isn't useful for charts, frontend will need to aggregate by month or we do it here
            revenueByProject,
        };
    }

    async getContentAnalytics() {
        // Top 5 programmes par vues
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const topPrograms = await (this.prisma as any).program.findMany({
            orderBy: { viewsCount: 'desc' },
            take: 5,
            select: { title: true, viewsCount: true, category: true },
        });

        // Répartition des programmes par catégorie
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const categoryDistribution = await (this.prisma as any).program.groupBy({
            by: ['category'],
            _count: { id: true },
        });

        return {
            topPrograms,
            categoryDistribution,
        };
    }

    async getModerationAnalytics() {
        // Répartition des statuts de témoignages
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const statusDistribution = await (this.prisma as any).testimony.groupBy({
            by: ['status'],
            _count: { id: true },
        });

        // Temps moyen de traitement (différence entre createdAt et reviewedAt - si on avait ce champ)
        // Pour V1, on renvoie juste les volumes
        return {
            statusDistribution,
        };
    }

    // TESTIMONIES MANAGEMENT
    async getTestimonies(status?: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).testimony.findMany({
            where: status ? { status } : {},
            orderBy: { createdAt: 'desc' },
            include: { reviewer: true },
        });
    }

    async updateTestimonyStatus(id: string, status: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).testimony.update({
            where: { id },
            data: { status },
        });
    }

    async validateTestimony(id: string, data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).testimony.update({
            where: { id },
            data: {
                ...data,
                status: 'valide',
            },
        });
    }

    async scheduleTestimony(id: string, scheduledFor: Date) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).testimony.update({
            where: { id },
            data: {
                scheduledFor,
                status: 'programme',
            },
        });
    }

    // FINANCES MANAGEMENT
    async getTransactions(status?: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).transaction.findMany({
            where: status ? { status } : {},
            orderBy: { createdAt: 'desc' },
            include: { validator: true, project: true },
        });
    }

    async validateTransaction(id: string, userId: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).transaction.update({
            where: { id },
            data: {
                status: 'verifie',
                validatedBy: userId,
            },
        });
    }

    async rejectTransaction(id: string, userId: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).transaction.update({
            where: { id },
            data: {
                status: 'rejete',
                validatedBy: userId,
            },
        });
    }

    // TEAM MANAGEMENT
    async getUsers() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).profile.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateUserRole(id: string, role: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).profile.update({
            where: { id },
            data: { role },
        });
    }

    async getVolunteers() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).volunteer.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async getPartners() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).partner.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    // SETTINGS MANAGEMENT
    async getSettings() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).appSettings.findUnique({
            where: { id: 1 },
        });
    }

    async updateSettings(data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).appSettings.upsert({
            where: { id: 1 },
            update: data,
            create: { id: 1, ...data },
        });
    }

    // PROGRAMS MANAGEMENT
    async getPrograms(category?: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).program.findMany({
            where: category ? { category } : {},
            orderBy: { createdAt: 'desc' },
        });
    }

    async createProgram(data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).program.create({
            data,
        });
    }

    async updateProgram(id: string, data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).program.update({
            where: { id },
            data,
        });
    }

    async deleteProgram(id: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).program.delete({
            where: { id },
        });
    }

    // ADS MANAGEMENT
    async getAds() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).ad.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async createAd(data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).ad.create({
            data,
        });
    }

    async updateAd(id: string, data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).ad.update({
            where: { id },
            data,
        });
    }

    async deleteAd(id: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).ad.delete({
            where: { id },
        });
    }

    // BOOKS MANAGEMENT
    async getBooks() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).book.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async createBook(data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).book.create({
            data,
        });
    }

    async updateBook(id: string, data: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).book.update({
            where: { id },
            data,
        });
    }

    async deleteBook(id: string) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return await (this.prisma as any).book.delete({
            where: { id },
        });
    }
}
