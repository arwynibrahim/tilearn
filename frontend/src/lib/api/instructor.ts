import apiClient from './client';
import type { Course, InstructorProfile, CourseReview, CreateReviewDto } from '@/types';

export const instructorApi = {
  profile: {
    get: async (): Promise<InstructorProfile> => {
      const { data } = await apiClient.get('/instructor/profile');
      return data;
    },
    update: async (payload: {
      bio?: string;
      expertiseAreas?: string[];
      bankAccountInfo?: string;
      taxId?: string;
    }): Promise<InstructorProfile> => {
      const { data } = await apiClient.patch('/instructor/profile', payload);
      return data;
    },
  },

  courses: {
    listMine: async (): Promise<Array<Course & { _count: { modules: number; enrollments: number; reviews: number } }>> => {
      const { data } = await apiClient.get('/instructor/courses');
      return data;
    },
  },

  stats: {
    get: async (): Promise<{
      totalCourses: number;
      totalEnrollments: number;
      totalReviews: number;
      averageRating: number;
    }> => {
      const { data } = await apiClient.get('/instructor/stats');
      return data;
    },
  },

  reviews: {
    create: async (dto: CreateReviewDto): Promise<CourseReview> => {
      const { data } = await apiClient.post('/reviews', dto);
      return data;
    },
    listByCourse: async (courseId: string): Promise<CourseReview[]> => {
      const { data } = await apiClient.get(`/courses/${courseId}/reviews`);
      return data;
    },
  },
};