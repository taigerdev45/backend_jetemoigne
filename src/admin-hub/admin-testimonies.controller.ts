import { Controller, Get, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AdminHubService } from './admin-hub.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('admin-testimonies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/testimonies')
export class AdminTestimoniesController {
    constructor(private readonly adminHubService: AdminHubService) { }

    @Get()
    @Roles('admin', 'super_admin', 'manager')
    @ApiOperation({ summary: 'Lister tous les témoignages (avec filtres)' })
    async list(@Query('status') status?: string) {
        return this.adminHubService.getTestimonies(status);
    }

    @Patch(':id/read')
    @Roles('admin', 'super_admin', 'manager')
    @ApiOperation({ summary: 'Marquer un témoignage comme "en lecture"' })
    async markAsRead(@Param('id') id: string) {
        return this.adminHubService.updateTestimonyStatus(id, 'en_lecture');
    }

    @Patch(':id/validate')
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Valider et corriger un témoignage' })
    async validate(
        @Param('id') id: string,
        @Body() data: { contentText?: string; adminNotes?: string },
    ) {
        return this.adminHubService.validateTestimony(id, data);
    }

    @Patch(':id/schedule')
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Planifier la publication d\'un témoignage' })
    async schedule(@Param('id') id: string, @Body('scheduledFor') scheduledFor: Date) {
        return this.adminHubService.scheduleTestimony(id, scheduledFor);
    }
}
