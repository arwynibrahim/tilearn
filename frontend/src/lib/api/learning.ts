import apiClient from './client';
import type { Certificate, CourseProgress, Enrollment } from '@/types';

interface QuizAnswer { questionId: string; answer: unknown; }
interface SubmitQuizPayload { quizId: string; answers: QuizAnswer[]; startedAt?: string; }
interface QuizAttemptResult {
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  attempt: { id: string };
}

export const learningApi = {
  enrollments: {
    list: async (): Promise<Enrollment[]> => {
      const { data } = await apiClient.get('/enrollments');
      return data;
    },
    create: async (courseId: string): Promise<Enrollment> => {
      const { data } = await apiClient.post('/enrollments', { courseId });
      return data;
    },
  },

  progress: {
    getByCourse: async (courseId: string): Promise<CourseProgress> => {
      const { data } = await apiClient.get(`/progress/${courseId}`);
      return data;
    },
    update: async (
      moduleId: string,
      payload: { status?: string; score?: number; timeSpentSeconds?: number; lastPosition?: string }
    ): Promise<void> => {
      await apiClient.post(`/progress/${moduleId}`, payload);
    },
  },

  quiz: {
    submit: async (payload: SubmitQuizPayload): Promise<QuizAttemptResult> => {
      const { data } = await apiClient.post('/quiz/submit', payload);
      return data;
    },
    getAttempts: async (quizId: string) => {
      const { data } = await apiClient.get(`/quiz/${quizId}/attempts`);
      return data;
    },
  },

  certificates: {
    list: async (): Promise<Certificate[]> => {
      const { data } = await apiClient.get('/certificates');
      return data;
    },
    generate: async (courseId: string): Promise<Certificate> => {
      const { data } = await apiClient.post(`/certificates/${courseId}`);
      return data;
    },
    verify: async (uid: string): Promise<Certificate & { valid: boolean }> => {
      const { data } = await apiClient.get(`/certificates/verify/${uid}`);
      return data;
    },
  },
};
