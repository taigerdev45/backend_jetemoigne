import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AdminHubService } from './admin-hub.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('admin-team')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/admin/team')
export class AdminTeamController {
    constructor(private readonly adminHubService: AdminHubService) { }

    @Get('users')
    @Roles('admin', 'super_admin')
    @ApiOperation({ summary: 'Lister les membres de l\'équipe' })
    async getUsers() {
        return this.adminHubService.getUsers();
    }

    @Patch('users/:id/role')
    @Roles('super_admin')
    @ApiOperation({ summary: 'Changer le rôle d\'un collaborateur (Super Admin uniquement)' })
    async updateRole(@Param('id') id: string, @Body('role') role: string) {
        return this.adminHubService.updateUserRole(id, role);
    }

    @Get('volunteers')
    @Roles('admin', 'super_admin', 'manager')
    @ApiOperation({ summary: 'Consulter le répertoire des bénévoles' })
    async getVolunteers() {
        return this.adminHubService.getVolunteers();
    }

    @Get('partners')
    @Roles('admin', 'super_admin', 'manager')
    @ApiOperation({ summary: 'Consulter le répertoire des partenaires' })
    async getPartners() {
        return this.adminHubService.getPartners();
    }
}
