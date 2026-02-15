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
@Controller('api/v1/admin/content')
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

        return this.adminHubService.createBook({
            ...dto,
            pdfUrl,
            coverUrl,
        });
    }

    // --- DELETIONS ---

    @Delete('programs/:id')
    @Roles('super_admin')
    async deleteProgram(@Param('id') id: string) {
        return this.adminHubService.deleteProgram(id);
    }

    @Delete('ads/:id')
    @Roles('super_admin')
    async deleteAd(@Param('id') id: string) {
        return this.adminHubService.deleteAd(id);
    }

    @Delete('books/:id')
    @Roles('super_admin')
    async deleteBook(@Param('id') id: string) {
        return this.adminHubService.deleteBook(id);
    }

    @Get('books')
    @Roles('admin', 'super_admin', 'manager')
    async getBooks() {
        return this.adminHubService.getBooks();
    }
}
