import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class SupportService {
    constructor(
        private prisma: PrismaService,
        private readonly notificationsGateway: NotificationsGateway,
    ) { }

    async createDonation(data: {
        donorName?: string;
        donorEmail?: string;
        donorPhone?: string;
        amount: number;
        currency?: string;
        transactionType?: any;
        paymentMethod?: string;
        proofScreenshotUrl?: string;
        transactionRefId?: string;
        projectId?: string;
    }) {
        // Si transactionType n'est pas fourni, on assume que c'est un don financier
        const transaction_type = data.transactionType || 'don_financier';

        const transaction = await this.prisma.transaction.create({
            data: {
                ...data,
                transactionType: transaction_type,
                status: 'en_attente',
            },
        });

        // Notifier les admins en temps réel
        this.notificationsGateway.notifyAdmins('donation_received', {
            id: transaction.id,
            donorName: transaction.donorName,
            amount: transaction.amount,
            currency: transaction.currency,
        });

        return transaction;
    }

    async createVolunteer(data: {
        fullName: string;
        email?: string;
        phone?: string;
        skills: string[];
        availability?: string;
    }) {
        return this.prisma.volunteer.create({
            data: {
                ...data,
                status: 'actif',
            },
        });
    }

    async createPartner(data: {
        name: string;
        activityDomain?: string;
        country?: string;
        logoUrl?: string;
        websiteUrl?: string;
    }) {
        return this.prisma.partner.create({
            data,
        });
    }
}
