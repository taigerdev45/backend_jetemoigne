import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { AdsService } from './ads.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('ads')
@Controller('ads')
export class AdsController {
    constructor(private readonly adsService: AdsService) { }

    @Get('active')
    @ApiOperation({
        summary: 'Lister les bannières publicitaires actives',
        description: 'Retourne toutes les publicités dont la date de diffusion est en cours.',
    })
    @ApiResponse({ status: 200, description: 'Liste des publicités actives récupérée.' })
    async findActive() {
        return this.adsService.findActive();
    }

    @Get('formats')
    @ApiOperation({
        summary: 'Obtenir les formats de publicité disponibles avec les tarifs',
        description: 'Retourne la liste des formats (banner_top, sidebar, interstitiel, etc.) avec le tarif journalier en XAF.',
    })
    @ApiResponse({ status: 200, description: 'Formats et tarifs récupérés.' })
    async getFormats() {
        return this.adsService.getFormats();
    }

    @Post('book')
    @ApiOperation({
        summary: 'Réserver un espace publicitaire et payer via Notch Pay',
        description: 'Initie une réservation publicitaire. Le montant est calculé automatiquement (tarif journalier × durée en jours). Retourne un lien de paiement Notch Pay.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                clientName: { type: 'string', example: 'Airtel Gabon', description: 'Nom du client ou de l\'annonceur' },
                clientEmail: { type: 'string', example: 'marketing@airtel.ga', description: 'Email de contact (reçoit la confirmation)' },
                clientPhone: { type: 'string', example: '+24174000000', description: 'Téléphone du contact (optionnel)' },
                clientCompany: { type: 'string', example: 'Airtel Gabon SA', description: 'Nom de la société (optionnel)' },
                format: {
                    type: 'string',
                    enum: ['banner_top', 'banner_bottom', 'sidebar', 'interstitial'],
                    example: 'banner_top',
                    description: 'Format de la publicité (voir GET /ads/formats pour les tarifs)',
                },
                startDate: { type: 'string', format: 'date-time', example: '2026-03-01T00:00:00Z', description: 'Date de début de diffusion' },
                endDate: { type: 'string', format: 'date-time', example: '2026-03-31T23:59:59Z', description: 'Date de fin de diffusion' },
                redirectUrl: { type: 'string', example: 'https://airtel.ga/offre', description: 'URL de redirection au clic sur la pub (optionnel)' },
                mediaUrl: { type: 'string', example: 'https://storage.supabase.co/...', description: 'URL de la bannière déjà uploadée (optionnel)' },
                currency: { type: 'string', example: 'XAF', default: 'XAF' },
                callbackUrl: { type: 'string', example: 'https://votre-site.com/ads/success', description: 'URL de retour après paiement (optionnel)' },
            },
            required: ['clientName', 'clientEmail', 'format', 'startDate', 'endDate'],
        },
    })
    @ApiResponse({ status: 201, description: 'Réservation initiée. Contient payment_url, totalPrice, et durée calculée.' })
    @ApiResponse({ status: 400, description: 'Format invalide, dates incorrectes, ou erreur Notch Pay.' })
    async bookAd(@Body() dto: any) {
        return this.adsService.bookAd(dto);
    }

    @Post(':id/click')
    @ApiOperation({ summary: 'Enregistrer un clic sur une publicité' })
    @ApiResponse({ status: 200, description: 'Clic enregistré.' })
    async recordClick(@Param('id') id: string) {
        return this.adsService.recordClick(id);
    }

    @Post(':id/view')
    @ApiOperation({ summary: 'Enregistrer une vue (impression) d\'une publicité' })
    @ApiResponse({ status: 200, description: 'Vue enregistrée.' })
    async recordView(@Param('id') id: string) {
        return this.adsService.recordView(id);
    }
}
