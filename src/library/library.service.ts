import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LibraryService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: { page?: number; limit?: number }) {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            this.prisma.book.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.book.count(),
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

    async findOne(id: string) {
        const book = await this.prisma.book.findUnique({
            where: { id },
        });

        if (!book) {
            throw new NotFoundException(`Ouvrage avec l'ID ${id} non trouvé`);
        }

        return book;
    }

    async recordDownload(id: string) {
        return this.prisma.book.update({
            where: { id },
            data: {
                downloadsCount: {
                    increment: 1,
                },
            },
        });
    }
}
