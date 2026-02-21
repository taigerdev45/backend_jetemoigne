import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Query,
    UseInterceptors,
    UploadedFiles,
    UploadedFile,
} from '@nestjs/common';
import { AdminHubService } from './admin-hub.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';

@ApiTags('admin-content')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/content')
export class AdminContentController {
    constructor(
        private readonly adminHubService: AdminHubService,
        private readonly storageService: StorageService,
    ) { }

    // --- PROGRAMS ---

    @Get('programs')
    @Roles('admin', 'super_admin', 'manager')
    @ApiOperation({ summary: 'Lister les programmes pour administration' })
    async getPrograms(@Query('category') category?: string) {
        return this.adminHubService.getPrograms(category);
    }

    @Post('programs')
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Créer un nouveau programme avec médias' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Journal de 20h' },
                category: { type: 'string', example: 'info', enum: ['info', 'jeunesse_cinema', 'divertissement', 'podcast', 'evangelisation', 'concert', 'temoignage_live'] },
                format: { type: 'string', example: 'video', enum: ['video', 'audio', 'ecrit', 'image'] },
                description: { type: 'string', example: 'Le journal du soir...' },
                duration: { type: 'number', example: 30 },
                thumbnail: { type: 'string', format: 'binary', description: 'Image miniature' },
                media: { type: 'string', format: 'binary', description: 'Fichier vidéo, audio ou image' },
            },
            required: ['title', 'category', 'format'],
        },
    })
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'thumbnail', maxCount: 1 },
            { name: 'media', maxCount: 1 },
        ]),
    )
    async createProgram(@Body() dto: any, @UploadedFiles() files: { thumbnail?: any[]; media?: any[] }) {
        let thumbnailUrl = dto.thumbnailUrl;
        let mediaUrl = dto.mediaUrl;

        if (files.thumbnail?.[0]) {
            thumbnailUrl = await this.storageService.uploadFile(files.thumbnail[0], 'public-assets');
        }

        if (files.media?.[0]) {
            mediaUrl = await this.storageService.uploadFile(files.media[0], 'public-assets');
        }

        const programData = {
            ...dto,
            thumbnailUrl,
            videoUrl: dto.format === 'video' ? mediaUrl : dto.videoUrl,
            audioUrl: dto.format === 'audio' ? mediaUrl : dto.audioUrl,
        };

        return this.adminHubService.createProgram(programData);
    }

    // --- ADS ---

    @Post('ads')
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Créer une publicité avec bannière' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'Pub Airtel Gabon' },
                redirectUrl: { type: 'string', example: 'https://airtel.ga' },
                position: { type: 'string', example: 'banner_top', enum: ['banner_top', 'banner_bottom', 'sidebar', 'interstitial'] },
                startDate: { type: 'string', format: 'date', example: '2026-03-01' },
                endDate: { type: 'string', format: 'date', example: '2026-03-31' },
                file: { type: 'string', format: 'binary', description: 'Image de la bannière publicitaire' },
            },
            required: ['title', 'redirectUrl'],
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async createAd(@Body() dto: any, @UploadedFile() file?: any) {
        let mediaUrl = dto.mediaUrl;

        if (file) {
            mediaUrl = await this.storageService.uploadFile(file, 'public-assets');
        }

        return this.adminHubService.createAd({
            ...dto,
            mediaUrl,
        });
    }

    // --- BOOKS ---

    @Post('books')
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Ajouter un ouvrage numérique avec PDF et Couverture' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: { type: 'string', example: 'La Parole qui Libère' },
                author: { type: 'string', example: 'Pasteur Jean Dupont' },
                description: { type: 'string', example: 'Un livre sur la foi et la guérison.' },
                price: { type: 'number', example: 3000, description: 'Prix en XAF. Si 0 ou absent, le livre est considéré comme Gratuit.' },
                currency: { type: 'string', example: 'XAF', default: 'XAF' },
                pdf: { type: 'string', format: 'binary', description: 'Fichier PDF de l ouvrage' },
                cover: { type: 'string', format: 'binary', description: 'Image de couverture' },
            },
            required: ['title', 'author'],
        },
    })
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'pdf', maxCount: 1 },
            { name: 'cover', maxCount: 1 },
        ]),
    )
    async createBook(@Body() dto: any, @UploadedFiles() files: { pdf?: any[]; cover?: any[] }) {
        let pdfUrl = dto.pdfUrl;
        let coverUrl = dto.coverUrl;

        if (files.pdf?.[0]) {
            pdfUrl = await this.storageService.uploadFile(files.pdf[0], 'books-files');
        }

        if (files.cover?.[0]) {
            coverUrl = await this.storageService.uploadFile(files.cover[0], 'public-assets');
        }

        const price = dto.price ? parseFloat(dto.price) : 0;
        const isFree = price <= 0;

        return this.adminHubService.createBook({
            ...dto,
            price,
            isFree,
            pdfUrl,
            coverUrl,
        });
    }

    // --- DELETIONS ---

    @Delete('programs/:id')
    @Roles('super_admin')
    @ApiOperation({ summary: 'Supprimer un programme (Super Admin)' })
    async deleteProgram(@Param('id') id: string) {
        return this.adminHubService.deleteProgram(id);
    }

    @Delete('ads/:id')
    @Roles('super_admin')
    @ApiOperation({ summary: 'Supprimer une publicité (Super Admin)' })
    async deleteAd(@Param('id') id: string) {
        return this.adminHubService.deleteAd(id);
    }

    @Delete('books/:id')
    @Roles('super_admin')
    @ApiOperation({ summary: 'Supprimer un ouvrage (Super Admin)' })
    async deleteBook(@Param('id') id: string) {
        return this.adminHubService.deleteBook(id);
    }

    @Get('books')
    @Roles('admin', 'super_admin', 'manager')
    async getBooks() {
        return this.adminHubService.getBooks();
    }
}
