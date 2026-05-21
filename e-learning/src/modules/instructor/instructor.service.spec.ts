import { Test, TestingModule } from '@nestjs/testing';
import { InstructorService } from './instructor.service';
import { PrismaService } from '../../prisma/prisma.service';

const mockPrisma = {
  instructorProfile: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  course: { findMany: jest.fn() },
  enrollment: { count: jest.fn() },
  courseReview: { count: jest.fn(), aggregate: jest.fn(), create: jest.fn(), findMany: jest.fn() },
};

describe('InstructorService', () => {
  let service: InstructorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstructorService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InstructorService>(InstructorService);
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return existing profile', async () => {
      const profile = { id: 'p1', userId: 'u1', bio: 'Prof', user: {} };
      mockPrisma.instructorProfile.findUnique.mockResolvedValue(profile);

      const result = await service.getProfile('u1');

      expect(mockPrisma.instructorProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        include: { user: { select: { id: true, email: true, nom: true, prenom: true, avatar: true } } },
      });
      expect(mockPrisma.instructorProfile.create).not.toHaveBeenCalled();
      expect(result).toEqual(profile);
    });

    it('should create profile if not exists', async () => {
      mockPrisma.instructorProfile.findUnique.mockResolvedValue(null);
      const created = { id: 'p1', userId: 'u1', user: {} };
      mockPrisma.instructorProfile.create.mockResolvedValue(created);

      const result = await service.getProfile('u1');

      expect(mockPrisma.instructorProfile.create).toHaveBeenCalledWith({
        data: { userId: 'u1' },
        include: { user: { select: { id: true, email: true, nom: true, prenom: true, avatar: true } } },
      });
      expect(result).toEqual(created);
    });
  });

  describe('updateProfile', () => {
    it('should update profile', async () => {
      mockPrisma.instructorProfile.findUnique.mockResolvedValue({ id: 'p1', userId: 'u1', user: {} });
      const updated = { id: 'p1', bio: 'New bio', user: {} };
      mockPrisma.instructorProfile.update.mockResolvedValue(updated);

      const result = await service.updateProfile('u1', { bio: 'New bio' });

      expect(mockPrisma.instructorProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        include: { user: { select: { id: true, email: true, nom: true, prenom: true, avatar: true } } },
      });
      expect(mockPrisma.instructorProfile.update).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        data: { bio: 'New bio' },
        include: { user: { select: { id: true, email: true, nom: true, prenom: true } } },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('getInstructorCourses', () => {
    it('should return courses created by user', async () => {
      const courses = [{ id: 'c1', domain: {}, _count: { modules: 2, enrollments: 5, reviews: 1 } }];
      mockPrisma.course.findMany.mockResolvedValue(courses);

      const result = await service.getInstructorCourses('u1');

      expect(mockPrisma.course.findMany).toHaveBeenCalledWith({
        where: { createdBy: 'u1' },
        include: {
          domain: true,
          _count: { select: { modules: true, enrollments: true, reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(courses);
    });
  });

  describe('getInstructorStats', () => {
    it('should return stats', async () => {
      mockPrisma.course.findMany.mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]);
      mockPrisma.enrollment.count.mockResolvedValue(50);
      mockPrisma.courseReview.count.mockResolvedValue(10);
      mockPrisma.courseReview.aggregate.mockResolvedValue({ _avg: { rating: 4.5 } });

      const result = await service.getInstructorStats('u1');

      expect(result).toEqual({
        totalCourses: 2,
        totalEnrollments: 50,
        totalReviews: 10,
        averageRating: 4.5,
      });
    });

    it('should return zero average rating if no reviews', async () => {
      mockPrisma.course.findMany.mockResolvedValue([]);
      mockPrisma.enrollment.count.mockResolvedValue(0);
      mockPrisma.courseReview.count.mockResolvedValue(0);
      mockPrisma.courseReview.aggregate.mockResolvedValue({ _avg: { rating: null } });

      const result = await service.getInstructorStats('u1');

      expect(result.averageRating).toBe(0);
    });
  });

  describe('createReview', () => {
    it('should create a review', async () => {
      const dto = { courseId: 'c1', rating: 5, comment: 'Great' };
      mockPrisma.courseReview.create.mockResolvedValue({ id: 'r1', ...dto, userId: 'u1', user: {} });

      const result = await service.createReview(dto, 'u1');

      expect(mockPrisma.courseReview.create).toHaveBeenCalledWith({
        data: { ...dto, userId: 'u1' },
        include: { user: { select: { nom: true, prenom: true, avatar: true } } },
      });
      expect(result).toEqual({ id: 'r1', ...dto, userId: 'u1', user: {} });
    });
  });

  describe('getCourseReviews', () => {
    it('should return reviews for a course', async () => {
      mockPrisma.courseReview.findMany.mockResolvedValue([{ id: 'r1', user: {} }]);

      const result = await service.getCourseReviews('c1');

      expect(mockPrisma.courseReview.findMany).toHaveBeenCalledWith({
        where: { courseId: 'c1' },
        include: { user: { select: { nom: true, prenom: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([{ id: 'r1', user: {} }]);
    });
  });
});
