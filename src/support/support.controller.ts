import { Controller, Post, Body } from '@nestjs/common';
import { SupportService } from './support.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('support')
@Controller('api/v1/support')
export class SupportController {
    constructor(private readonly supportService: SupportService) { }

    @Post('donations')
    @ApiOperation({ summary: 'Enregistrer un don financier (Mobile Money)' })
    @ApiResponse({ status: 201, description: 'Don enregistré en attente de vérification.' })
    async createDonation(@Body() donationDto: any) {
        return this.supportService.createDonation(donationDto);
    }

    @Post('volunteer')
    @ApiOperation({ summary: 'Soumettre une candidature de bénévolat' })
    @ApiResponse({ status: 201, description: 'Candidature enregistrée.' })
    async createVolunteer(@Body() volunteerDto: any) {
        return this.supportService.createVolunteer(volunteerDto);
    }

    @Post('partner')
    @ApiOperation({ summary: 'Soumettre une proposition de partenariat' })
    @ApiResponse({ status: 201, description: 'Proposition enregistrée.' })
    async createPartner(@Body() partnerDto: any) {
        return this.supportService.createPartner(partnerDto);
    }
}
