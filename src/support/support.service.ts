import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
    constructor(private prisma: PrismaService) { }

    async createDonation(data: {
        donorName?: string;
        donorEmail?: string;
        donorPhone?: string;
        amount: number;
        currency?: string;
        transactionType: any;
        paymentMethod?: string;
        proofScreenshotUrl?: string;
        transactionRefId?: string;
        projectId?: string;
    }) {
        return (this.prisma as any).transaction.create({
            data: {
                ...data,
                status: 'en_attente',
            },
        });
    }

    async createVolunteer(data: {
        fullName: string;
        email?: string;
        phone?: string;
        skills: string[];
        availability?: string;
    }) {
        return (this.prisma as any).volunteer.create({
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
        return (this.prisma as any).partner.create({
            data,
        });
    }
}
