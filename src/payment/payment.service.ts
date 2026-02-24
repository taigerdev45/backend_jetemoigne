import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);
    private readonly notchPayApi = 'https://api.notchpay.co';

    constructor(
        private prisma: PrismaService,
        private readonly notificationsGateway: NotificationsGateway,
    ) { }

    /**
     * Initialiser un paiement via Notch Pay
     * @param data { amount: number, currency: string, email: string, description: string }
     */
    async initializePayment(data: {
        amount: number;
        currency: string;
        email: string;
        description: string;
        callback_url?: string;
    }) {
        try {
            const response = await axios.post(
                `${this.notchPayApi}/payments/initialize`,
                {
                    amount: data.amount,
                    currency: data.currency.toUpperCase(),
                    email: data.email.toLowerCase().trim(),
                    description: data.description,
                    callback_url: data.callback_url,
                },
                {
                    headers: {
                        Authorization: process.env.NOTCH_PAY_PUBLIC_KEY,
                        'X-Public-Key': process.env.NOTCH_PAY_PUBLIC_KEY, // Parfois requis par Notch Pay pour identifier le compte
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                },
            );

            return response.data;
        } catch (error) {
            const notchError = error.response?.data;
            const httpStatus = error.response?.status;
            this.logger.error(
                `Erreur Notch Pay (HTTP ${httpStatus}) lors de l'initialisation`,
                JSON.stringify(notchError || error.message),
            );
            throw Object.assign(
                new Error(`Notch Pay (${httpStatus ?? 'network'}): ${JSON.stringify(notchError) || error.message}`),
                { notchPayDetails: notchError },
            );
        }
    }

    /**
     * Vérifier le statut d'un paiement
     * @param reference Référence de la transaction Notch Pay
     */
    async verifyPayment(reference: string) {
        try {
            const response = await axios.get(
                `${this.notchPayApi}/payments/${reference}`,
                {
                    headers: {
                        Authorization: process.env.NOTCH_PAY_SECRET_KEY,
                        Accept: 'application/json',
                    },
                },
            );

            return response.data;
        } catch (error) {
            this.logger.error(`Erreur lors de la vérification du paiement ${reference}`, error.response?.data || error.message);
            throw new Error('Échec de la vérification du paiement');
        }
    }

    /**
     * Traiter un succès de paiement
     * @param reference Référence de la transaction Notch Pay
     */
    async handlePaymentSuccess(reference: string) {
        try {
            // 1. Trouver la transaction associée
            const transaction = await this.prisma.transaction.findFirst({
                where: { transactionRefId: reference },
                include: { project: true },
            });

            if (!transaction) {
                this.logger.warn(`Transaction non trouvée pour la référence Notch Pay: ${reference}`);
                return;
            }

            if (transaction.status === 'verifie') {
                this.logger.log(`Transaction ${transaction.id} déjà marquée comme vérifiée.`);
                return;
            }

            // 2. Mettre à jour le statut de la transaction
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: { status: 'verifie' },
            });

            // 3. Si c'est un don pour un projet, mettre à jour le montant du projet
            if (transaction.projectId && transaction.project) {
                const newAmount = Number(transaction.project.currentAmount || 0) + Number(transaction.amount);
                const goalAmount = Number(transaction.project.goalAmount || 0);
                const progressPercent = goalAmount > 0 ? Math.min(100, Math.round((newAmount / goalAmount) * 100)) : 0;

                await this.prisma.project.update({
                    where: { id: transaction.projectId },
                    data: {
                        currentAmount: newAmount,
                        progressPercent,
                    },
                });
            }

            // 4. Notifier les admins
            this.notificationsGateway.notifyAdmins('donation_verified', {
                id: transaction.id,
                donorName: transaction.donorName,
                amount: transaction.amount,
                currency: transaction.currency,
                projectTitle: transaction.project?.title,
            });

            this.logger.log(`Transaction ${transaction.id} confirmée avec succès via Notch Pay.`);
        } catch (error) {
            this.logger.error(`Erreur lors du traitement du succès de paiement ${reference}`, error.message);
        }
    }
}
