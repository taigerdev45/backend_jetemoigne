import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class AdminHubService {
    constructor(
        private prisma: PrismaService,
        private readonly notificationsGateway: NotificationsGateway,
    ) { }

    async getDashboardStats() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const totalVisits = await this.prisma.analyticsDaily.aggregate({
            _sum: { totalVisits: true },
        });

        const donations = await this.prisma.transaction.aggregate({
            where: { transactionType: 'don_financier', status: 'verifie' },
            _sum: { amount: true },
            _count: { id: true },
        });

        const testimoniesCount = await this.prisma.testimony.count();
        const pendingTestimonies = await this.prisma.testimony.count({
            where: { status: 'recu' },
        });

        const programsCount = await this.prisma.program.count();
        const activeAds = await this.prisma.ad.count({
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
        return await this.prisma.analyticsDaily.findMany({
            orderBy: { date: 'desc' },
            take: 30,
        });
    }

    // ADVANCED ANALYTICS
    async getFinanceAnalytics() {
        // Revenus mensuels des 6 derniers mois
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await this.prisma.transaction.groupBy({
            by: ['createdAt'],
            where: {
                transactionType: 'don_financier',
                status: 'verifie',
                createdAt: { gte: sixMonthsAgo },
            },
            _sum: { amount: true },
        });

        // Répartition par projet
        const revenueByProject = await this.prisma.transaction.groupBy({
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
        const topPrograms = await this.prisma.program.findMany({
            orderBy: { viewsCount: 'desc' },
            take: 5,
            select: { title: true, viewsCount: true, category: true },
        });

        // Répartition des programmes par catégorie
        const categoryDistribution = await this.prisma.program.groupBy({
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
        const statusDistribution = await this.prisma.testimony.groupBy({
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
    async getTestimonies(status?: any) {
        return await this.prisma.testimony.findMany({
            where: status ? { status } : {},
            orderBy: { createdAt: 'desc' },
            include: { reviewer: true },
        });
    }

    async updateTestimonyStatus(id: string, status: any) {
        return await this.prisma.testimony.update({
            where: { id },
            data: { status },
        });
    }

    async validateTestimony(id: string, data: any) {
        return await this.prisma.testimony.update({
            where: { id },
            data: {
                ...data,
                status: 'valide',
            },
        });
    }

    async scheduleTestimony(id: string, scheduledFor: Date) {
        return await this.prisma.testimony.update({
            where: { id },
            data: {
                scheduledFor,
                status: 'programme',
            },
        });
    }

    // FINANCES MANAGEMENT
    async getTransactions(status?: any) {
        return await this.prisma.transaction.findMany({
            where: status ? { status } : {},
            orderBy: { createdAt: 'desc' },
            include: { validator: true, project: true },
        });
    }

    async validateTransaction(id: string, userId: string) {
        const transaction = await this.prisma.transaction.update({
            where: { id },
            data: {
                status: 'verifie',
                validatedBy: userId,
            },
        });

        // Notifier via WebSockets
        if (this.notificationsGateway) {
            this.notificationsGateway.notifyAdmins('transaction_validated', {
                id: transaction.id,
                amount: transaction.amount,
                validatedBy: userId,
            });
        }

        return transaction;
    }

    async rejectTransaction(id: string, userId: string) {
        return await this.prisma.transaction.update({
            where: { id },
            data: {
                status: 'rejete',
                validatedBy: userId,
            },
        });
    }

    // TEAM MANAGEMENT
    async getUsers() {
        return await this.prisma.profile.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateUserRole(id: string, role: any) {
        return await this.prisma.profile.update({
            where: { id },
            data: { role },
        });
    }

    async getVolunteers() {
        return await this.prisma.volunteer.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async getPartners() {
        return await this.prisma.partner.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    // SETTINGS MANAGEMENT
    async getSettings() {
        return await this.prisma.appSettings.findUnique({
            where: { id: 1 },
        });
    }

    async updateSettings(data: any) {
        return await this.prisma.appSettings.upsert({
            where: { id: 1 },
            update: data,
            create: { id: 1, ...data },
        });
    }

    // PROGRAMS MANAGEMENT
    async getPrograms(category?: any) {
        return await this.prisma.program.findMany({
            where: category ? { category } : {},
            orderBy: { createdAt: 'desc' },
        });
    }

    async createProgram(data: any) {
        return await this.prisma.program.create({
            data,
        });
    }

    async updateProgram(id: string, data: any) {
        return await this.prisma.program.update({
            where: { id },
            data,
        });
    }

    async deleteProgram(id: string) {
        return await this.prisma.program.delete({
            where: { id },
        });
    }

    // ADS MANAGEMENT
    async getAds() {
        return await this.prisma.ad.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async createAd(data: any) {
        return await this.prisma.ad.create({
            data,
        });
    }

    async updateAd(id: string, data: any) {
        return await this.prisma.ad.update({
            where: { id },
            data,
        });
    }

    async deleteAd(id: string) {
        return await this.prisma.ad.delete({
            where: { id },
        });
    }

    // BOOKS MANAGEMENT
    async getBooks() {
        return await this.prisma.book.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async createBook(data: any) {
        return await this.prisma.book.create({
            data,
        });
    }

    async updateBook(id: string, data: any) {
        return await this.prisma.book.update({
            where: { id },
            data,
        });
    }

    async deleteBook(id: string) {
        return await this.prisma.book.delete({
            where: { id },
        });
    }
}
