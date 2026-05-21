import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { CreateLicenseDto } from './dto/create-license.dto';
import { CreateLearningPathDto } from './dto/create-learningpath.dto';

@Injectable()
export class B2bService {
  constructor(private prisma: PrismaService) {}

  // ─── Organizations ──────────────────────────────────────────

  async createOrganization(dto: CreateOrganizationDto) {
    return this.prisma.organization.create({ data: dto });
  }

  async findAllOrganizations() {
    return this.prisma.organization.findMany({
      include: { _count: { select: { licenses: true, learningPaths: true, vrHeadsets: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOneOrganization(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        licenses: true,
        learningPaths: { include: { courses: { include: { course: true } } } },
        vrHeadsets: true,
      },
    });
    if (!org) throw new NotFoundException('Organisation non trouvée');
    return org;
  }

  // ─── Licences ───────────────────────────────────────────────

  async createLicense(dto: CreateLicenseDto) {
    const org = await this.prisma.organization.findUnique({ where: { id: dto.organizationId } });
    if (!org) throw new NotFoundException('Organisation non trouvée');
    return this.prisma.license.create({ data: dto });
  }

  async assignLicense(licenseId: string, userId: string, assignedBy: string) {
    const license = await this.prisma.license.findUnique({ where: { id: licenseId } });
    if (!license) throw new NotFoundException('Licence non trouvée');
    if (license.usedCount >= license.quantity) throw new Error('Licence épuisée');

    const assignment = await this.prisma.licenseAssignment.create({
      data: { licenseId, userId, assignedBy },
    });

    await this.prisma.license.update({
      where: { id: licenseId },
      data: { usedCount: { increment: 1 } },
    });

    return assignment;
  }

  async revokeLicense(assignmentId: string) {
    const assignment = await this.prisma.licenseAssignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('Assignation non trouvée');

    await this.prisma.license.update({
      where: { id: assignment.licenseId },
      data: { usedCount: { decrement: 1 } },
    });

    return this.prisma.licenseAssignment.update({
      where: { id: assignmentId },
      data: { revokedAt: new Date() },
    });
  }

  async getOrganizationLicenses(organizationId: string) {
    return this.prisma.license.findMany({
      where: { organizationId },
      include: { assignments: { include: { user: { select: { id: true, email: true, nom: true, prenom: true } } } } },
    });
  }

  // ─── Parcours d'apprentissage ───────────────────────────────

  async createLearningPath(dto: CreateLearningPathDto) {
    return this.prisma.learningPath.create({
      data: {
        organizationId: dto.organizationId,
        title: dto.title,
        description: dto.description,
        isMandatory: dto.isMandatory,
        createdBy: dto.createdBy,
        courses: {
          create: dto.courses.map((c, i) => ({ courseId: c.courseId, order: i + 1 })),
        },
      },
      include: { courses: { include: { course: true } } },
    });
  }

  async getOrganizationLearningPaths(organizationId: string) {
    return this.prisma.learningPath.findMany({
      where: { organizationId },
      include: { courses: { include: { course: { select: { id: true, title: true, slug: true } } }, orderBy: { order: 'asc' } } },
    });
  }
}
