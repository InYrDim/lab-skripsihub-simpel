import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TopicsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.topic.findMany({ orderBy: { name: 'asc' } });
  }

  async create(input: { name?: string; description?: string }) {
    const name = input.name?.trim();
    if (!name) {
      throw new BadRequestException('Topic name is required');
    }

    return this.prisma.topic.create({
      data: {
        name,
        description: input.description?.trim() || null,
      },
    });
  }

  async toggle(id: string) {
    const topic = await this.prisma.topic.findUnique({ where: { id } });
    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return this.prisma.topic.update({
      where: { id },
      data: { isActive: !topic.isActive },
    });
  }
}
