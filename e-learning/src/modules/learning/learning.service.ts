import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import * as crypto from 'crypto';

@Injectable()
export class LearningService {
  constructor(private prisma: PrismaService) {}

  // ─── Inscriptions ───────────────────────────────────────────

  async enroll(dto: CreateEnrollmentDto, userId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundException('Cours non trouvé');

    const existing = await this.prisma.enrollment.findFirst({
      where: { userId, courseId: dto.courseId, status: 'ACTIVE' },
    });
    if (existing) throw new BadRequestException('Déjà inscrit à ce cours');

    return this.prisma.enrollment.create({
      data: { userId, courseId: dto.courseId },
      include: { course: { select: { id: true, title: true } } },
    });
  }

  async getUserEnrollments(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, title: true, slug: true, thumbnail: true, level: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  // ─── Progression ────────────────────────────────────────────

  async updateProgress(userId: string, moduleId: string, data: { status?: string; score?: number; timeSpentSeconds?: number; lastPosition?: string }) {
    const module = await this.prisma.module.findUnique({ where: { id: moduleId } });
    if (!module) throw new NotFoundException('Module non trouvé');

    const existing = await this.prisma.progress.findUnique({
      where: { userId_moduleId: { userId, moduleId } },
    });

    if (existing) {
      return this.prisma.progress.update({
        where: { id: existing.id },
        data: { ...data, completedAt: data.status === 'COMPLETED' ? new Date() : undefined },
      });
    }

    return this.prisma.progress.create({
      data: {
        userId,
        moduleId,
        ...data,
        startedAt: new Date(),
      },
    });
  }

  async getUserProgress(userId: string, courseId: string) {
    const modules = await this.prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });

    const progress = await this.prisma.progress.findMany({
      where: { userId, module: { courseId } },
    });

    const modulesWithProgress = modules.map((mod) => {
      const prog = progress.find((p) => p.moduleId === mod.id);
      return {
        ...mod,
        progress: prog || { status: 'NOT_STARTED', score: null, timeSpentSeconds: 0 },
      };
    });

    const totalModules = modules.length;
    const completedModules = progress.filter((p) => p.status === 'COMPLETED').length;
    const completionPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    return {
      modules: modulesWithProgress,
      stats: { totalModules, completedModules, completionPercent },
    };
  }

  // ─── Quiz ───────────────────────────────────────────────────

  async submitQuiz(dto: SubmitQuizDto, userId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
      include: { questions: true },
    });
    if (!quiz) throw new NotFoundException('Quiz non trouvé');

    let score = 0;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);

    for (const answer of dto.answers) {
      const question = quiz.questions.find((q) => q.id === answer.questionId);
      if (question && question.correctAnswer === answer.answer) {
        score += question.points || 1;
      }
    }

    const finalScore = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const passed = quiz.passingScore ? finalScore >= quiz.passingScore : finalScore >= 50;

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId: dto.quizId,
        score: finalScore,
        answers: dto.answers as unknown as Prisma.InputJsonValue,
        startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
        completedAt: new Date(),
        passed,
      },
    });

    return { attempt, score: finalScore, passed, totalQuestions: quiz.questions.length, correctAnswers: score };
  }

  async getUserQuizAttempts(userId: string, quizId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { completedAt: 'desc' },
    });
  }

  // ─── Certificats ────────────────────────────────────────────

  async generateCertificate(userId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { userId, courseId, status: 'COMPLETED' },
    });
    if (!enrollment) throw new BadRequestException('Cours non terminé');

    const certificateUid = crypto.randomUUID();
    const verificationUrl = `https://tilearning.net/verify/${certificateUid}`;

    return this.prisma.certificate.create({
      data: {
        userId,
        courseId,
        certificateUid,
        verificationUrl,
        qrCodeHash: crypto.createHash('sha256').update(certificateUid).digest('hex'),
      },
      include: {
        user: { select: { nom: true, prenom: true } },
        course: { select: { title: true } },
      },
    });
  }

  async getUserCertificates(userId: string) {
    return this.prisma.certificate.findMany({
      where: { userId, revokedAt: null },
      include: { course: { select: { title: true, slug: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async verifyCertificate(uid: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { certificateUid: uid },
      include: {
        user: { select: { nom: true, prenom: true } },
        course: { select: { title: true, domain: true } },
      },
    });
    if (!cert || cert.revokedAt) throw new NotFoundException('Certificat invalide ou révoqué');
    return { valid: true, ...cert };
  }
}
