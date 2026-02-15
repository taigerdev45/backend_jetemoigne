import { Controller, Get, Patch, Param, UseGuards, Query, Req } from '@nestjs/common';
import { AdminHubService } from './admin-hub.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('admin-finances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/admin/finances')
export class AdminFinancesController {
    constructor(private readonly adminHubService: AdminHubService) { }

    @Get('transactions')
    @Roles('admin', 'super_admin', 'accountant')
    @ApiOperation({ summary: 'Lister toutes les transactions (dons, achats, etc.)' })
    async list(@Query('status') status?: string) {
        return this.adminHubService.getTransactions(status);
    }

    @Patch('transactions/:id/validate')
    @Roles('admin', 'super_admin', 'accountant')
    @ApiOperation({ summary: 'Valider manuellement une transaction (preuve vérifiée)' })
    async validate(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.userId;
        return this.adminHubService.validateTransaction(id, userId);
    }

    @Patch('transactions/:id/reject')
    @Roles('admin', 'super_admin', 'accountant')
    @ApiOperation({ summary: 'Rejeter une transaction' })
    async reject(@Param('id') id: string, @Req() req: any) {
        const userId = req.user.userId;
        return this.adminHubService.rejectTransaction(id, userId);
    }
}
