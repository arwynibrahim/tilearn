import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class InstructorService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    let profile = await this.prisma.instructorProfile.findUnique({
      where: { userId },
      include: { user: { select: { id: true, email: true, nom: true, prenom: true, avatar: true } } },
    });

    if (!profile) {
      profile = await this.prisma.instructorProfile.create({
        data: { userId },
        include: { user: { select: { id: true, email: true, nom: true, prenom: true, avatar: true } } },
      });
    }

    return profile;
  }

  async updateProfile(userId: string, data: { bio?: string; expertiseAreas?: string[]; bankAccountInfo?: string; taxId?: string }) {
    await this.getProfile(userId);
    return this.prisma.instructorProfile.update({
      where: { userId },
      data,
      include: { user: { select: { id: true, email: true, nom: true, prenom: true } } },
    });
  }

  async getInstructorCourses(userId: string) {
    return this.prisma.course.findMany({
      where: { createdBy: userId },
      include: {
        domain: true,
        _count: { select: { modules: true, enrollments: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getInstructorStats(userId: string) {
    const courses = await this.prisma.course.findMany({
      where: { createdBy: userId },
      select: { id: true },
    });
    const courseIds = courses.map((c) => c.id);

    const [totalEnrollments, totalReviews, avgRating] = await Promise.all([
      this.prisma.enrollment.count({ where: { courseId: { in: courseIds } } }),
      this.prisma.courseReview.count({ where: { courseId: { in: courseIds } } }),
      this.prisma.courseReview.aggregate({
        where: { courseId: { in: courseIds } },
        _avg: { rating: true },
      }),
    ]);

    return {
      totalCourses: courses.length,
      totalEnrollments,
      totalReviews,
      averageRating: avgRating._avg.rating || 0,
    };
  }

  // ─── Avis ───────────────────────────────────────────────────

  async createReview(dto: CreateReviewDto, userId: string) {
    return this.prisma.courseReview.create({
      data: { ...dto, userId },
      include: { user: { select: { nom: true, prenom: true, avatar: true } } },
    });
  }

  async getCourseReviews(courseId: string) {
    return this.prisma.courseReview.findMany({
      where: { courseId },
      include: { user: { select: { nom: true, prenom: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
