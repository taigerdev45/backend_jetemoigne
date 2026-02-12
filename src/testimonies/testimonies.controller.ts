import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { TestimoniesService } from './testimonies.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('testimonies')
@Controller('api/v1/testimonies')
export class TestimoniesController {
    constructor(private readonly testimoniesService: TestimoniesService) { }

    @Post()
    @ApiOperation({ summary: 'Soumettre un nouveau témoignage (Public)' })
    @ApiResponse({ status: 201, description: 'Témoignage reçu avec succès.' })
    async create(@Body() createDto: any) {
        return this.testimoniesService.create(createDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lister les témoignages validés (Public)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Liste des témoignages récupérée.' })
    async findPublic(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.testimoniesService.findPublic({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
        });
    }

    @Get('admin')
    @ApiOperation({ summary: 'Lister tous les témoignages pour modération (Admin)' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: ['recu', 'en_lecture', 'valide', 'rejete', 'programme'] })
    @ApiResponse({ status: 200, description: 'Liste complète récupérée.' })
    async findAllAdmin(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: any,
    ) {
        return this.testimoniesService.findAllAdmin({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 10,
            status,
        });
    }
}
