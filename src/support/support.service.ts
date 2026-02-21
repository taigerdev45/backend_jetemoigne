import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class SupportService {
    constructor(
        private prisma: PrismaService,
        private readonly notificationsGateway: NotificationsGateway,
        private readonly paymentService: PaymentService,
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
        automatic?: boolean;
    }) {
        const transaction_type = data.transactionType || 'don_financier';

        // 1. Enregistrer la transaction en base de données
        const transaction = await this.prisma.transaction.create({
            data: {
                donorName: data.donorName,
                donorEmail: data.donorEmail,
                donorPhone: data.donorPhone,
                amount: data.amount,
                currency: data.currency || 'XAF',
                transactionType: transaction_type,
                paymentMethod: data.paymentMethod,
                proofScreenshotUrl: data.proofScreenshotUrl,
                transactionRefId: data.transactionRefId,
                projectId: data.projectId,
                status: 'en_attente',
            },
        });

        // 2. Si c'hui est un paiement automatique (Notch Pay)
        if (data.automatic && data.donorEmail) {
            try {
                const payment = await this.paymentService.initializePayment({
                    amount: data.amount,
                    currency: data.currency || 'XAF',
                    email: data.donorEmail,
                    description: `Don Je Témoigne TV - ${transaction.id}`,
                    callback_url: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/payment-callback` : undefined,
                });

                // Mettre à jour la transaction avec la référence Notch Pay
                await this.prisma.transaction.update({
                    where: { id: transaction.id },
                    data: { transactionRefId: payment.data.reference },
                });

                // Retourner l'URL de paiement à l'utilisateur
                return {
                    ...transaction,
                    payment_url: payment.data.authorization_url,
                    reference: payment.data.reference,
                };
            } catch (error) {
                // Si l'initiation échoue, on garde la transaction mais on signale l'erreur
                return {
                    ...transaction,
                    error: "Échec de l'initiation du paiement Notch Pay",
                };
            }
        }

        // 3. Notifier les admins en temps réel (pour les dons manuels ou réussites)
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
