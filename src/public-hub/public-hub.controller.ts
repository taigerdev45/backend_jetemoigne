import { Controller, Get } from '@nestjs/common';
import { PublicHubService } from './public-hub.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('public-hub')
@Controller('public-hub')
export class PublicHubController {
    constructor(private readonly publicHubService: PublicHubService) { }

    @Get('home')
    @ApiOperation({
        summary: 'Charger les données de la page d\'accueil',
        description: 'Agrège les programmes, actus, pubs, projets urgents et derniers témoignages.',
    })
    @ApiResponse({ status: 200, description: 'Données agrégées récupérées avec succès.' })
    async getHome() {
        return this.publicHubService.getHomeData();
    }

    @Get('stats')
    @ApiOperation({
        summary: 'Obtenir les statistiques globales d\'impact',
        description: 'Nombre de donateurs, bénévoles et témoignages validés.',
    })
    @ApiResponse({ status: 200, description: 'Statistiques récupérées avec succès.' })
    async getStats() {
        return this.publicHubService.getGlobalStats();
    }

    @Get('settings')
    @ApiOperation({
        summary: 'Obtenir les paramètres de l\'application',
        description: 'Numéros Moov/Airtel, email de contact et règles de don.',
    })
    @ApiResponse({ status: 200, description: 'Paramètres récupérés avec succès.' })
    async getSettings() {
        return this.publicHubService.getSettings();
    }
}
