import { Controller, Get, Post, Body, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { TestimoniesService } from './testimonies.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';

@ApiTags('testimonies')
@Controller('testimonies')
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
                mediaType: { type: 'string', enum: ['video', 'audio', 'ecrit', 'image'] },
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

        try {
            // Si un fichier est fourni, on l'uploade sur Supabase (bucket testimonies-media)
            if (file) {
                mediaUrl = await this.storageService.uploadFile(file, 'testimonies-media');
            }

            // On filtre les données pour ne passer que ce qui est attendu par le service (et Prisma)
            const sanitizedData = {
                authorName: dto.authorName,
                authorEmail: dto.authorEmail,
                title: dto.title,
                contentText: dto.contentText,
                mediaType: dto.mediaType,
                mediaUrl,
            };

            return await this.testimoniesService.create(sanitizedData);
        } catch (error: any) {
            console.error('Erreur détaillée lors de la création du témoignage:', error);
            // On renvoie un message plus explicite pour débugger
            throw new Error(`Erreur Interne: ${error.message || 'Inconnue'}`);
        }
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

}
