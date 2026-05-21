import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateDomainDto } from './dto/create-domain.dto';
import { CreateModuleDto } from './dto/create-module.dto';

@Injectable()
export class CatalogueService {
  constructor(private prisma: PrismaService) {}

  // ─── Domaines ───────────────────────────────────────────────

  async createDomain(dto: CreateDomainDto) {
    const existing = await this.prisma.domain.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new ConflictException('Ce slug de domaine existe déjà');
    return this.prisma.domain.create({ data: dto });
  }

  async findAllDomains() {
    return this.prisma.domain.findMany({
      include: { _count: { select: { courses: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOneDomain(id: string) {
    const domain = await this.prisma.domain.findUnique({
      where: { id },
      include: { courses: { where: { isPublished: true }, include: { modules: true } } },
    });
    if (!domain) throw new NotFoundException('Domaine non trouvé');
    return domain;
  }

  // ─── Cours ──────────────────────────────────────────────────

  async createCourse(dto: CreateCourseDto, userId: string) {
    const slug = dto.title
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return this.prisma.course.create({
      data: { ...dto, slug, createdBy: userId },
      include: { domain: true },
    });
  }

  async findAllCourses(page = 1, limit = 20, filters?: { domainId?: string; level?: string }) {
    const where: any = { isPublished: true };
    if (filters?.domainId) where.domainId = filters.domainId;
    if (filters?.level) where.level = filters.level;

    const skip = (page - 1) * limit;
    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          domain: true,
          creator: { select: { id: true, nom: true, prenom: true } },
          _count: { select: { modules: true, enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);
    return { courses, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOneCourse(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        domain: true,
        creator: { select: { id: true, nom: true, prenom: true, avatar: true } },
        modules: { orderBy: { order: 'asc' } },
        reviews: { include: { user: { select: { nom: true, prenom: true, avatar: true } } } },
      },
    });
    if (!course) throw new NotFoundException('Cours non trouvé');
    return course;
  }

  async updateCourse(id: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Cours non trouvé');
    return this.prisma.course.update({ where: { id }, data: dto, include: { domain: true } });
  }

  async removeCourse(id: string) {
    await this.prisma.course.update({ where: { id }, data: { isPublished: false } });
    return { message: 'Cours dépublié' };
  }

  // ─── Modules ────────────────────────────────────────────────

  async createModule(dto: CreateModuleDto) {
    const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundException('Cours non trouvé');

    const maxOrder = await this.prisma.module.aggregate({
      where: { courseId: dto.courseId },
      _max: { order: true },
    });
    const order = dto.order ?? (maxOrder._max.order ?? 0) + 1;

    return this.prisma.module.create({
      data: { ...dto, order },
      include: { course: { select: { id: true, title: true } } },
    });
  }

  async findModulesByCourse(courseId: string) {
    return this.prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: { vrScene: true, quizzes: true },
    });
  }

  async updateModule(id: string, dto: Partial<CreateModuleDto>) {
    const mod = await this.prisma.module.findUnique({ where: { id } });
    if (!mod) throw new NotFoundException('Module non trouvé');
    return this.prisma.module.update({ where: { id }, data: dto });
  }
}
