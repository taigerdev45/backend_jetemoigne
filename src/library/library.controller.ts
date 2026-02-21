import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { LibraryService } from './library.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('library')
@Controller('library')
export class LibraryController {
    constructor(private readonly libraryService: LibraryService) { }

    @Get('books')
    @ApiOperation({ summary: 'Lister tous les ouvrages numériques (Boutique)' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiResponse({ status: 200, description: 'Liste des ouvrages récupérée.' })
    async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
        return this.libraryService.findAll({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
        });
    }

    @Get('books/:id')
    @ApiOperation({ summary: 'Obtenir les détails d\'un ouvrage' })
    @ApiResponse({ status: 200, description: 'Détails de l\'ouvrage récupérés.' })
    @ApiResponse({ status: 404, description: 'Ouvrage non trouvé.' })
    async findOne(@Param('id') id: string) {
        return this.libraryService.findOne(id);
    }

    @Post('books/:id/download')
    @ApiOperation({ summary: 'Enregistrer un téléchargement gratuit (Incrémenter le compteur)' })
    @ApiResponse({ status: 200, description: 'Téléchargement enregistré.' })
    async recordDownload(@Param('id') id: string) {
        return this.libraryService.recordDownload(id);
    }

    @Post('books/:id/purchase')
    @ApiOperation({
        summary: 'Acheter un ouvrage via Notch Pay',
        description: 'Initie un paiement Notch Pay pour l\'achat d\'un ouvrage. Si le livre est gratuit, retourne directement le lien PDF.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                buyerName: { type: 'string', example: 'Jean Gabin' },
                buyerEmail: { type: 'string', example: 'jean@example.com' },
                buyerPhone: { type: 'string', example: '+24106000000' },
                currency: { type: 'string', example: 'XAF', default: 'XAF' },
                callbackUrl: { type: 'string', example: 'https://votre-site.com/library/success', description: 'URL de retour après paiement (optionnel)' },
            },
            required: ['buyerName', 'buyerEmail'],
        },
    })
    @ApiResponse({ status: 201, description: 'Lien de paiement Notch Pay généré ou PDF direct si gratuit.' })
    @ApiResponse({ status: 404, description: 'Ouvrage non trouvé.' })
    @ApiResponse({ status: 400, description: 'Prix non défini ou erreur Notch Pay.' })
    async purchaseBook(@Param('id') id: string, @Body() dto: any) {
        return this.libraryService.purchaseBook(id, dto);
    }
}
