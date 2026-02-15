import { Controller, Get, Post, Body, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { TestimoniesService } from './testimonies.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';

@ApiTags('testimonies')
@Controller('api/v1/testimonies')
export class TestimoniesController {
    constructor(
        private readonly testimoniesService: TestimoniesService,
        private readonly storageService: StorageService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Soumettre un nouveau témoignage (Public)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                authorName: { type: 'string' },
                authorEmail: { type: 'string' },
                title: { type: 'string' },
                contentText: { type: 'string' },
                mediaType: { type: 'string', enum: ['video', 'audio', 'ecrit'] },
                file: { type: 'string', format: 'binary' },
            },
            required: ['authorName', 'mediaType'],
        },
    })
    @ApiResponse({ status: 201, description: 'Témoignage reçu avec succès.' })
    @UseInterceptors(FileInterceptor('file'))
    async create(
        @Body() dto: any,
        @UploadedFile() file?: any,
    ) {
        let mediaUrl = dto.mediaUrl;

        // Si un fichier est fourni, on l'uploade sur Supabase (bucket testimonies-media)
        if (file) {
            mediaUrl = await this.storageService.uploadFile(file, 'testimonies-media');
        }

        return this.testimoniesService.create({
            ...dto,
            mediaUrl,
        });
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
