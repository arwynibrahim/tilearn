import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { CreateLicenseDto } from './dto/create-license.dto';
import { CreateLearningPathDto } from './dto/create-learningpath.dto';

@Injectable()
export class B2bService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // ─── Organizations ──────────────────────────────────────────

  async createOrganization(dto: CreateOrganizationDto) {
    const { adminEmail, adminPrenom, adminNom, ...orgData } = dto;

    const existing = await this.prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) {
      throw new ConflictException('Un compte existe déjà avec cet email administratif');
    }

    const rawPassword = crypto.randomBytes(4).toString('hex');
    const passwordHash = await hash(rawPassword, 12);

    const [org] = await this.prisma.$transaction(async (tx) => {
      const created = await tx.organization.create({ data: orgData });
      const adminUser = await tx.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          nom: adminNom,
          prenom: adminPrenom,
        },
      });
      // INDIVIDUAL LEARNER as default personal context
      await tx.membership.create({
        data: { userId: adminUser.id, contextType: 'INDIVIDUAL', role: 'LEARNER' },
      });
      // ORGANIZATION ADMIN in this org
      await tx.membership.create({
        data: { userId: adminUser.id, contextType: 'ORGANIZATION', contextId: created.id, role: 'ADMIN' },
      });
      return [created];
    });

    try {
      await this.emailService.sendOrganizationWelcomeEmail(
        adminEmail,
        adminPrenom,
        org.name,
        adminEmail,
        rawPassword,
      );
    } catch {
      // L'email n'a pas pu être envoyé, mais l'organisation est créée
    }

    return org;
  }

  async findAllOrganizations(memberships?: Array<{ contextType: string; contextId: string | null; role: string }>) {
    // ADMIN org memberships restrict the view to their specific org(s)
    const adminOrgIds = (memberships ?? [])
      .filter((m) => m.contextType === 'ORGANIZATION' && m.role === 'ADMIN' && m.contextId)
      .map((m) => m.contextId as string);

    const where = adminOrgIds.length > 0 ? { id: { in: adminOrgIds } } : {};
    return this.prisma.organization.findMany({
      where,
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

  async updateOrganization(id: string, dto: Partial<CreateOrganizationDto>) {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) throw new NotFoundException('Organisation non trouvée');
    return this.prisma.organization.update({ where: { id }, data: dto });
  }

  async removeOrganization(id: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: { _count: { select: { licenses: true, learningPaths: true, vrHeadsets: true } } },
    });
    if (!org) throw new NotFoundException('Organisation non trouvée');
    if (org._count.licenses > 0 || org._count.learningPaths > 0 || org._count.vrHeadsets > 0) {
      throw new ConflictException('Impossible de supprimer une organisation avec des ressources associées');
    }
    await this.prisma.organization.delete({ where: { id } });
    return { message: 'Organisation supprimée' };
  }

  // ─── Licences ───────────────────────────────────────────────

  async createLicense(dto: CreateLicenseDto) {
    const org = await this.prisma.organization.findUnique({ where: { id: dto.organizationId } });
    if (!org) throw new NotFoundException('Organisation non trouvée');
    return this.prisma.license.create({
      data: {
        ...dto,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    });
  }

  async updateLicense(id: string, dto: Partial<CreateLicenseDto>) {
    const license = await this.prisma.license.findUnique({ where: { id } });
    if (!license) throw new NotFoundException('Licence non trouvée');
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.license.update({ where: { id }, data });
  }

  async removeLicense(id: string) {
    const license = await this.prisma.license.findUnique({
      where: { id },
      include: { _count: { select: { assignments: true } } },
    });
    if (!license) throw new NotFoundException('Licence non trouvée');
    if (license._count.assignments > 0) {
      throw new ConflictException('Impossible de supprimer une licence avec des assignations actives');
    }
    await this.prisma.license.delete({ where: { id } });
    return { message: 'Licence supprimée' };
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

  async updateLearningPath(id: string, dto: Partial<CreateLearningPathDto>) {
    const path = await this.prisma.learningPath.findUnique({
      where: { id },
      include: { courses: true },
    });
    if (!path) throw new NotFoundException('Parcours non trouvé');

    // Supprimer les anciens cours et recréer si fournis
    if (dto.courses) {
      await this.prisma.learningPathCourse.deleteMany({ where: { pathId: id } });
    }

    return this.prisma.learningPath.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        isMandatory: dto.isMandatory,
        ...(dto.courses && {
          courses: {
            create: dto.courses.map((c, i) => ({ courseId: c.courseId, order: i + 1 })),
          },
        }),
      },
      include: { courses: { include: { course: true } } },
    });
  }

  async removeLearningPath(id: string) {
    const path = await this.prisma.learningPath.findUnique({ where: { id } });
    if (!path) throw new NotFoundException('Parcours non trouvé');
    await this.prisma.learningPathCourse.deleteMany({ where: { pathId: id } });
    await this.prisma.learningPath.delete({ where: { id } });
    return { message: 'Parcours supprimé' };
  }
}
