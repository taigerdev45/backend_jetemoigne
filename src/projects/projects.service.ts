import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const projects = await this.prisma.project.findMany({
            include: {
                milestones: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        // Proactive calculation of progress based on amount if not manually set
        return projects.map((project: any) => {
            const goal = project.goalAmount ? parseFloat(project.goalAmount.toString()) : 0;
            const current = project.currentAmount ? parseFloat(project.currentAmount.toString()) : 0;
            const autoProgress = goal > 0 ? Math.round((current / goal) * 100) : 0;

            return {
                ...project,
                progressPercent: project.progressPercent ?? autoProgress,
            };
        });
    }

    async findOne(id: string) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                milestones: true,
                team: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!project) {
            throw new NotFoundException(`Projet avec l'ID ${id} non trouvé`);
        }

        const goal = project.goalAmount ? parseFloat(project.goalAmount.toString()) : 0;
        const current = project.currentAmount ? parseFloat(project.currentAmount.toString()) : 0;
        const autoProgress = goal > 0 ? Math.round((current / goal) * 100) : 0;

        return {
            ...project,
            progressPercent: project.progressPercent ?? autoProgress,
        };
    }
}
