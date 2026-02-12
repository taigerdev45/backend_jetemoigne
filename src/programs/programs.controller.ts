import {
    Controller,
    Get,
    Param,
    Query,
    Post,
    ParseIntPipe,
} from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('programs')
@Controller('api/v1/programs')
export class ProgramsController {
    constructor(private readonly programsService: ProgramsService) { }

    @Get()
    @ApiOperation({ summary: 'Lister les programmes avec filtres' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'category', required: false, enum: ['info', 'jeunesse_cinema', 'divertissement', 'podcast', 'evangelisation', 'concert', 'temoignage_live'] })
    @ApiQuery({ name: 'format', required: false, enum: ['video', 'audio', 'ecrit', 'image'] })
    @ApiQuery({ name: 'search', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Liste des programmes récupérée.' })
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('category') category?: any,
        @Query('format') format?: any,
        @Query('search') search?: string,
    ) {
        return this.programsService.findAll({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            category,
            format,
            search,
        });
    }

    @Get('live')
    @ApiOperation({ summary: 'Obtenir les informations du direct actuel' })
    @ApiResponse({ status: 200, description: 'Infos du direct récupérées.' })
    async getLive() {
        return this.programsService.getCurrentLive();
    }

    @Get(':slug')
    @ApiOperation({ summary: 'Obtenir les détails d\'un programme par son slug' })
    @ApiResponse({ status: 200, description: 'Programme trouvé.' })
    @ApiResponse({ status: 404, description: 'Programme non trouvé.' })
    async findOne(@Param('slug') slug: string) {
        return this.programsService.findOneBySlug(slug);
    }

    @Post(':id/view')
    @ApiOperation({ summary: 'Incrémenter le compteur de vues d\'un programme' })
    @ApiResponse({ status: 200, description: 'Vues incrémentées.' })
    async incrementViews(@Param('id') id: string) {
        return this.programsService.incrementViews(id);
    }
}
