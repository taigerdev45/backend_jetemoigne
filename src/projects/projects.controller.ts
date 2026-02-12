import { Controller, Get, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('projects')
@Controller('api/v1/projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Get()
    @ApiOperation({
        summary: 'Lister tous les projets de la chaîne',
        description: 'Retourne la vision, les besoins et la progression de chaque projet.',
    })
    @ApiResponse({ status: 200, description: 'Liste des projets récupérée.' })
    async findAll() {
        return this.projectsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtenir les détails d\'un projet spécifique' })
    @ApiResponse({ status: 200, description: 'Détails du projet récupérés.' })
    @ApiResponse({ status: 404, description: 'Projet non trouvé.' })
    async findOne(@Param('id') id: string) {
        return this.projectsService.findOne(id);
    }
}
