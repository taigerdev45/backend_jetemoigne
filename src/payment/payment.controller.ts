import { Controller, Post, Body, Headers, Res, HttpStatus, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import * as crypto from 'crypto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(private readonly paymentService: PaymentService) { }

    @Post('initiate')
    @ApiOperation({ summary: 'Initialiser un nouveau paiement' })
    @ApiResponse({ status: 201, description: 'Lien de paiement généré.' })
    async initiate(@Body() data: any) {
        return this.paymentService.initializePayment(data);
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Webhook pour recevoir les notifications de Notch Pay' })
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
