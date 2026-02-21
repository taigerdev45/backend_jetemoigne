import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AdminHubService } from './admin-hub.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/hub')
export class AdminHubController {
    constructor(private readonly adminHubService: AdminHubService) { }

    @Get('dashboard')
    @Roles('admin', 'super_admin', 'manager')
    @ApiOperation({ summary: 'Obtenir les statistiques du tableau de bord admin' })
    async getDashboard() {
        return this.adminHubService.getDashboardStats();
    }

    @Get('analytics/daily')
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Obtenir les analyses quotidiennes des 30 derniers jours' })
    async getAnalytics() {
        return this.adminHubService.getDailyAnalytics();
    }

    @Get('analytics/finances')
    @Roles('admin', 'super_admin', 'accountant')
    @ApiOperation({ summary: 'Analyses détaillées des finances' })
    async getFinanceAnalytics() {
        return this.adminHubService.getFinanceAnalytics();
    }

    @Get('analytics/content')
    @Roles('admin', 'super_admin', 'manager')
    @ApiOperation({ summary: 'Analyses de performance des contenus' })
    async getContentAnalytics() {
        return this.adminHubService.getContentAnalytics();
    }

    @Get('analytics/moderation')
    @Roles('admin', 'super_admin', 'manager')
    @ApiOperation({ summary: 'Statistiques de modération' })
    async getModerationAnalytics() {
        return this.adminHubService.getModerationAnalytics();
    }

    @Get('settings')
    @Roles('admin', 'super_admin', 'manager')
    @ApiOperation({ summary: 'Obtenir les paramètres vitaux de l\'application' })
    async getSettings() {
        return this.adminHubService.getSettings();
    }

    @Patch('settings')
    @Roles('super_admin')
    @ApiOperation({ summary: 'Mettre à jour les paramètres vitaux (Super Admin)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                airtelMoneyNumber: { type: 'string', example: '+24174000000' },
                moovMoneyNumber: { type: 'string', example: '+24166000000' },
                contactEmail: { type: 'string', example: 'contact@jetemoigne.tv' },
                donationRules: { type: 'string', example: 'Don minimum : 1000 XAF' },
                siteName: { type: 'string', example: 'Je Témoigne TV' },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'Paramètres mis à jour avec succès.' })
    async updateSettings(@Body() data: any) {
        return this.adminHubService.updateSettings(data);
    }
}
