import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TestimoniesService {
    constructor(private prisma: PrismaService) { }

    async create(data: {
        authorName?: string;
        authorEmail?: string;
        title?: string;
        contentText?: string;
        mediaUrl?: string;
        mediaType: any;
    }) {
        return (this.prisma as any).testimony.create({
            data: {
                ...data,
                status: 'recu', // Default status for new testimonies
            },
        });
    }

    async findPublic(query: { page?: number; limit?: number }) {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            (this.prisma as any).testimony.findMany({
                where: { status: 'valide' },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            (this.prisma as any).testimony.count({
                where: { status: 'valide' },
            }),
        ]);

        return {
            items,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async findAllAdmin(query: { page?: number; limit?: number; status?: any }) {
        const { page = 1, limit = 10, status } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;

        const [items, total] = await Promise.all([
            (this.prisma as any).testimony.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            (this.prisma as any).testimony.count({ where }),
        ]);

        return {
            items,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }
}
