import { Controller, Post, Body, Headers, Res, HttpStatus, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';
import type { Response } from 'express';
import * as crypto from 'crypto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(private readonly paymentService: PaymentService) { }

    @Post('initiate')
    @ApiOperation({ summary: 'Initialiser un nouveau paiement' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                amount: { type: 'number', example: 5000 },
                currency: { type: 'string', example: 'XAF' },
                email: { type: 'string', example: 'donateur@exemple.com' },
                description: { type: 'string', example: 'Don Je Témoigne TV' },
                callback_url: { type: 'string', example: 'https://votre-site.com/merci' },
            },
            required: ['amount', 'currency', 'email', 'description'],
        },
    })
    @ApiResponse({ status: 201, description: 'Lien de paiement généré.' })
    async initiate(@Body() data: any) {
        return this.paymentService.initializePayment(data);
    }

    @Post('webhook')
    @ApiOperation({
        summary: 'Webhook pour recevoir les notifications de Notch Pay',
        description: 'Endpoint appelé automatiquement par Notch Pay. Ne pas appeler manuellement. Vérifie la signature HMAC SHA256 via le header `x-notch-signature`.',
    })
    @ApiHeader({ name: 'x-notch-signature', description: 'Signature HMAC (SHA256) fournie par Notch Pay', required: false })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                event: { type: 'string', example: 'payment.complete' },
                data: {
                    type: 'object',
                    properties: {
                        reference: { type: 'string', example: 'NOTCH-REF-...' },
                        amount: { type: 'number', example: 5000 },
                        status: { type: 'string', example: 'complete' },
                    },
                },
            },
        },
    })
    async handleWebhook(
        @Headers('x-notch-signature') signature: string,
        @Body() payload: any,
        @Res() res: Response,
    ) {
        // 1. Vérifier la signature (Sécurité)
        const secret = process.env.NOTCH_PAY_WEBHOOK_SECRET;

        if (secret && signature) {
            const hash = crypto
                .createHmac('sha256', secret)
                .update(JSON.stringify(payload))
                .digest('hex');

            if (hash !== signature) {
                this.logger.warn('Signature webhook invalide');
                return res.status(HttpStatus.BAD_REQUEST).send('Invalid signature');
            }
        }

        // 2. Traiter l'événement
        this.logger.log(`Webhook reçu: ${payload.event}`, payload.data?.reference);

        if (payload.event === 'payment.complete') {
            await this.paymentService.handlePaymentSuccess(payload.data.reference);
        }

        return res.status(HttpStatus.OK).send('Webhook processed');
    }
}
