import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgramsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: {
        page?: number;
        limit?: number;
        category?: any;
        format?: any;
        search?: string;
    }) {
        const { page = 1, limit = 10, category, format, search } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (category) where.category = category;
        if (format) where.format = format;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [items, total] = await Promise.all([
            (this.prisma as any).program.findMany({
                where,
                skip,
                take: limit,
                orderBy: { publishedAt: 'desc' },
            }),
            (this.prisma as any).program.count({ where }),
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

    async findOneBySlug(slug: string) {
        const program = await (this.prisma as any).program.findUnique({
            where: { slug },
        });

        if (!program) {
            throw new NotFoundException(`Programme avec le slug ${slug} non trouvé`);
        }

        return program;
    }

    async getCurrentLive() {
        return (this.prisma as any).program.findFirst({
            where: { isLive: true },
        });
    }

    async incrementViews(id: string) {
        return (this.prisma as any).program.update({
            where: { id },
            data: {
                viewsCount: {
                    increment: 1,
                },
            },
        });
    }
}
