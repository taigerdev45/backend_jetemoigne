import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentService } from '../payment/payment.service';

// Tarifs par défaut (XAF / jour par format)
const AD_FORMAT_PRICING: Record<string, { label: string; dailyRate: number; description: string }> = {
    banner_top: {
        label: 'Bannière Haute (Header)',
        dailyRate: 5000,
        description: 'Bannière pleine largeur en haut de chaque page. Très haute visibilité.',
    },
    banner_bottom: {
        label: 'Bannière Basse (Footer)',
        dailyRate: 3000,
        description: 'Bannière en bas de page. Idéale pour le remarketing.',
    },
    sidebar: {
        label: 'Colonne Latérale (Sidebar)',
        dailyRate: 2500,
        description: 'Bloc publicitaire dans la colonne de droite des pages de contenu.',
    },
    interstitial: {
        label: 'Interstitiel (Plein Écran)',
        dailyRate: 8000,
        description: 'Publicité plein écran avant le visionnage d\'une vidéo. Impact maximal.',
    },
};

@Injectable()
export class AdsService {
    constructor(
        private prisma: PrismaService,
        private readonly paymentService: PaymentService,
    ) { }

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

    /**
     * Retourner les formats de publicité disponibles avec les tarifs
     */
    getFormats() {
        return Object.entries(AD_FORMAT_PRICING).map(([key, value]) => ({
            format: key,
            ...value,
            currency: 'XAF',
            example: `Pour 7 jours : ${value.dailyRate * 7} XAF`,
        }));
    }

    /**
     * Calculer le prix d'une pub selon le format et la durée
     */
    calculateAdPrice(format: string, startDate: Date, endDate: Date): number {
        const pricing = AD_FORMAT_PRICING[format];
        if (!pricing) throw new BadRequestException(`Format de publicité invalide: "${format}". Formats valides: ${Object.keys(AD_FORMAT_PRICING).join(', ')}`);

        const msPerDay = 1000 * 60 * 60 * 24;
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay);

        if (days <= 0) throw new BadRequestException('La date de fin doit être après la date de début.');
        if (days > 365) throw new BadRequestException('La durée maximale est de 365 jours.');

        return pricing.dailyRate * days;
    }

    /**
     * Réserver une publicité et initier le paiement Notch Pay
     */
    async bookAd(data: {
        clientName: string;
        clientEmail: string;
        clientPhone?: string;
        clientCompany?: string;
        format: string;
        startDate: string;
        endDate: string;
        redirectUrl?: string;
        mediaUrl?: string;
        currency?: string;
        callbackUrl?: string;
    }) {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);

        // Valider les dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new BadRequestException('Dates invalides. Format attendu : ISO 8601 (ex: 2026-03-01T00:00:00Z)');
        }
        if (start < new Date()) {
            throw new BadRequestException('La date de début doit être dans le futur.');
        }

        // Calculer le prix
        const totalPrice = this.calculateAdPrice(data.format, start, end);
        const currency = data.currency || 'XAF';
        const formatInfo = AD_FORMAT_PRICING[data.format];
        const msPerDay = 1000 * 60 * 60 * 24;
        const nbDays = Math.ceil((end.getTime() - start.getTime()) / msPerDay);

        // Créer une transaction en BDD
        const transaction = await this.prisma.transaction.create({
            data: {
                donorName: data.clientName,
                donorEmail: data.clientEmail,
                donorPhone: data.clientPhone,
                amount: totalPrice,
                currency,
                transactionType: 'paiement_pub',
                status: 'en_attente',
                transactionRefId: `ad_booking:${data.format}:${data.startDate}_${data.endDate}`,
            },
        });

        // Initier le paiement Notch Pay
        try {
            const payment = await this.paymentService.initializePayment({
                amount: totalPrice,
                currency,
                email: data.clientEmail,
                description: `Réservation pub "${formatInfo.label}" - ${nbDays} jour(s) - Je Témoigne TV`,
                callback_url: data.callbackUrl || (process.env.FRONTEND_URL
                    ? `${process.env.FRONTEND_URL}/ads/payment-callback`
                    : undefined),
            });

            // Mettre à jour la transaction avec la référence Notch Pay
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: { transactionRefId: payment.transaction?.reference },
            });

            return {
                transactionId: transaction.id,
                payment_url: payment.authorization_url,
                reference: payment.transaction?.reference,
                summary: {
                    format: data.format,
                    formatLabel: formatInfo.label,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    durationDays: nbDays,
                    dailyRate: formatInfo.dailyRate,
                    totalPrice,
                    currency,
                },
            };
        } catch (error) {
            // Rollback
            await this.prisma.transaction.delete({ where: { id: transaction.id } });
            throw new BadRequestException({
                message: `Impossible d'initialiser le paiement Notch Pay`,
                notchpay_error: error.message,
                notchpay_details: (error as any).notchPayDetails ?? null,
            });
        }
    }
}
