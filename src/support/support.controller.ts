import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { SupportService } from './support.service';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';

@ApiTags('support')
@Controller('support')
export class SupportController {
    constructor(
        private readonly supportService: SupportService,
        private readonly storageService: StorageService,
    ) { }

    @Post('donations')
    @ApiOperation({ summary: 'Enregistrer un don financier (Mobile Money)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                donorName: { type: 'string' },
                donorEmail: { type: 'string' },
                donorPhone: { type: 'string' },
                amount: { type: 'number' },
                currency: { type: 'string', default: 'XAF' },
                transactionReference: { type: 'string' },
                projectId: { type: 'string' },
                file: { type: 'string', format: 'binary', description: 'Preuve de paiement (M-Pesa/AirtelMoney)' },
            },
            required: ['donorName', 'amount'],
        },
    })
    @ApiResponse({ status: 201, description: 'Don enregistré en attente de vérification.' })
    @UseInterceptors(FileInterceptor('file'))
    async createDonation(
        @Body() donationDto: any,
        @UploadedFile() file?: any,
    ) {
        let proofScreenshotUrl = donationDto.proofScreenshotUrl;

        if (file) {
            // Pour les preuves de dons, on utilise le bucket 'transaction-proofs'
            proofScreenshotUrl = await this.storageService.uploadFile(file, 'transaction-proofs');
        }

        return this.supportService.createDonation({
            donorName: donationDto.donorName,
            donorEmail: donationDto.donorEmail,
            donorPhone: donationDto.donorPhone,
            currency: donationDto.currency,
            transactionRefId: donationDto.transactionReference,
            projectId: donationDto.projectId,
            proofScreenshotUrl,
            amount: parseFloat(donationDto.amount),
        });
    }

    @Post('donations/initiate')
    @ApiOperation({ summary: 'Initier un don automatique via Notch Pay' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                donorName: { type: 'string', example: 'Jean Gabin' },
                donorEmail: { type: 'string', example: 'jean@example.com' },
                donorPhone: { type: 'string', example: '+24106000000' },
                amount: { type: 'number', example: 1000 },
                currency: { type: 'string', default: 'XAF', example: 'XAF' },
                projectId: { type: 'string', description: 'ID du projet (optionnel)' },
            },
            required: ['donorName', 'donorEmail', 'amount'],
        },
    })
    @ApiResponse({ status: 201, description: 'Lien de paiement Notch Pay généré.' })
    async initiateDonation(@Body() donationDto: any) {
        return this.supportService.createDonation({
            ...donationDto,
            amount: parseFloat(donationDto.amount),
            automatic: true,
        });
    }

    @Post('volunteer')
    @ApiOperation({ summary: 'Soumettre une candidature de bénévolat' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                fullName: { type: 'string', example: 'Paul Nguema' },
                email: { type: 'string', example: 'paul@example.com' },
                phone: { type: 'string', example: '+24107000000' },
                skills: { type: 'array', items: { type: 'string' }, example: ['Vidéo', 'Montage'] },
                availability: { type: 'string', example: 'Week-ends et soirées' },
            },
            required: ['fullName'],
        },
    })
    @ApiResponse({ status: 201, description: 'Candidature enregistrée.' })
    async createVolunteer(@Body() volunteerDto: any) {
        return this.supportService.createVolunteer(volunteerDto);
    }

    @Post('partner')
    @ApiOperation({ summary: 'Soumettre une proposition de partenariat' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Société XYZ' },
                activityDomain: { type: 'string', example: 'Médias & Communication' },
                country: { type: 'string', example: 'Gabon' },
                logoUrl: { type: 'string', example: 'https://...' },
                websiteUrl: { type: 'string', example: 'https://xyz.com' },
            },
            required: ['name'],
        },
    })
    @ApiResponse({ status: 201, description: 'Proposition enregistrée.' })
    async createPartner(@Body() partnerDto: any) {
        return this.supportService.createPartner(partnerDto);
    }
}
