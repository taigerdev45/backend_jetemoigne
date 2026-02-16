import { Controller, Get, Param, Query, Post } from '@nestjs/common';
import { LibraryService } from './library.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('library')
@Controller('library')
export class LibraryController {
    constructor(private readonly libraryService: LibraryService) { }

    @Get('books')
    @ApiOperation({ summary: 'Lister tous les ouvrages numériques (Boutique)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
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
    @ApiOperation({ summary: 'Enregistrer un téléchargement (Incrémenter le compteur)' })
    @ApiResponse({ status: 200, description: 'Téléchargement enregistré.' })
    async recordDownload(@Param('id') id: string) {
        return this.libraryService.recordDownload(id);
    }
}
