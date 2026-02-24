import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class LibraryService {
    constructor(
        private prisma: PrismaService,
        private readonly paymentService: PaymentService,
    ) { }

    async findAll(query: { page?: number; limit?: number }) {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.prisma.book.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.book.count(),
        ]);

        return {
            items,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const book = await this.prisma.book.findUnique({
            where: { id },
        });

        if (!book) {
            throw new NotFoundException(`Ouvrage avec l'ID ${id} non trouvé`);
        }

        return book;
    }

    async recordDownload(id: string) {
        return this.prisma.book.update({
            where: { id },
            data: {
                downloadsCount: {
                    increment: 1,
                },
            },
        });
    }

    /**
     * Initier l'achat d'un ouvrage via Notch Pay
     */
    async purchaseBook(bookId: string, data: {
        buyerName: string;
        buyerEmail: string;
        buyerPhone?: string;
        currency?: string;
        callbackUrl?: string;
    }) {
        // 1. Récupérer l'ouvrage
        const book = await this.findOne(bookId);

        // 2. Vérifier si le livre est gratuit
        if (book.isFree) {
            // Pour un livre gratuit, on incrémente juste le compteur et on retourne le pdf
            await this.recordDownload(bookId);
            return {
                isFree: true,
                pdfUrl: book.pdfUrl,
                message: 'Ouvrage gratuit. Téléchargement disponible.',
            };
        }

        // 3. Vérifier que le livre a un prix
        const price = Number(book.price);
        if (!price || price <= 0) {
            throw new BadRequestException("Le prix de cet ouvrage n'est pas défini.");
        }

        // 4. Créer une transaction en BDD
        const transaction = await this.prisma.transaction.create({
            data: {
                donorName: data.buyerName,
                donorEmail: data.buyerEmail,
                donorPhone: data.buyerPhone,
                amount: price,
                currency: data.currency || 'XAF',
                transactionType: 'achat_ouvrage',
                status: 'en_attente',
                // On stocke l'ID du livre dans transactionRefId temporairement
                // Il sera remplacé par la ref Notch Pay
                transactionRefId: `book:${bookId}`,
            },
        });

        // 5. Initier le paiement Notch Pay
        try {
            const payment = await this.paymentService.initializePayment({
                amount: price,
                currency: data.currency || 'XAF',
                email: data.buyerEmail,
                description: `Achat ouvrage "${book.title}" - Je Témoigne TV`,
                callback_url: data.callbackUrl || process.env.FRONTEND_URL
                    ? `${process.env.FRONTEND_URL}/library/payment-callback?bookId=${bookId}`
                    : undefined,
            });

            // 6. Mettre à jour la transaction avec la vraie référence Notch Pay
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: { transactionRefId: payment.transaction?.reference },
            });

            return {
                isFree: false,
                transactionId: transaction.id,
                payment_url: payment.authorization_url,
                reference: payment.transaction?.reference,
                book: {
                    id: book.id,
                    title: book.title,
                    price: book.price,
                    currency: data.currency || 'XAF',
                },
            };
        } catch (error) {
            // Rollback : Supprimer la transaction créée si le paiement échoue
            await this.prisma.transaction.delete({ where: { id: transaction.id } });
            throw new BadRequestException(
                `Impossible d'initialiser le paiement Notch Pay: ${error.message}`,
            );
        }
    }
}
