import { Controller, Get, Post, Param } from '@nestjs/common';
import { AdsService } from './ads.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('ads')
@Controller('ads')
export class AdsController {
    constructor(private readonly adsService: AdsService) { }

    @Get('active')
    @ApiOperation({ summary: 'Lister les bannières publicitaires actives' })
    @ApiResponse({ status: 200, description: 'Liste des publicités actives récupérée.' })
    async findActive() {
        return this.adsService.findActive();
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
