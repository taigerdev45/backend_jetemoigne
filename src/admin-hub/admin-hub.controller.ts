import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AdminHubService } from './admin-hub.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/admin/hub')
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
    async updateSettings(@Body() data: any) {
        return this.adminHubService.updateSettings(data);
    }
}
