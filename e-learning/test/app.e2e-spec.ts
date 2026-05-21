import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaModule } from '../src/prisma/prisma.module';
import { AuthModule } from '../src/modules/auth/auth.module';
import { UsersModule } from '../src/modules/users/users.module';
import { CatalogueModule } from '../src/modules/catalogue/catalogue.module';
import { VrModule } from '../src/modules/vr/vr.module';
import { LearningModule } from '../src/modules/learning/learning.module';
import { PaymentModule } from '../src/modules/payment/payment.module';
import { B2bModule } from '../src/modules/b2b/b2b.module';
import { MdmModule } from '../src/modules/mdm/mdm.module';
import { InstructorModule } from '../src/modules/instructor/instructor.module';
import { RolesModule } from '../src/modules/roles/roles.module';
import { EmailModule } from '../src/modules/email/email.module';
import { RolePermissions } from '../src/modules/roles/permissions';
import { EmailService } from '../src/modules/email/email.service';
import { AuthService } from '../src/modules/auth/auth.service';
import * as crypto from 'crypto';
import * as express from 'express';

const supertest = require('supertest') as any;

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  domain: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
  course: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
  module: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), aggregate: jest.fn() },
  enrollment: { findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn() },
  progress: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  quiz: { findUnique: jest.fn() },
  quizAttempt: { create: jest.fn(), findMany: jest.fn() },
  certificate: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  payment: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn(), count: jest.fn() },
  subscription: { create: jest.fn(), findMany: jest.fn() },
  organization: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
  license: { create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
  licenseAssignment: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  learningPath: { create: jest.fn(), findMany: jest.fn() },
  vRHeadset: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  chargingStation: { create: jest.fn(), findMany: jest.fn() },
  instructorProfile: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  courseReview: { count: jest.fn(), aggregate: jest.fn(), create: jest.fn(), findMany: jest.fn() },
  permission: { findMany: jest.fn(), findUnique: jest.fn(), upsert: jest.fn() },
  rolePermission: { upsert: jest.fn() },
  vRScene: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

const mockEmailService = {
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendMail: jest.fn().mockResolvedValue(undefined),
};

function buildApp(module: TestingModule): INestApplication {
  const app = module.createNestApplication();
  app.use(express.json({ limit: '10mb' }));
  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  return app;
}

function getAuthToken(): string {
  const jwt = new JwtService({ privateKey, publicKey, signOptions: { algorithm: 'RS256', expiresIn: '15m' } });
  return jwt.sign({ sub: 'test-user-id', email: 'admin@test.com', role: 'SUPER_ADMIN' });
}

describe('E2E: API (full)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({
            JWT_PRIVATE_KEY: privateKey,
            JWT_PUBLIC_KEY: publicKey,
            JWT_ACCESS_EXPIRATION: '15m',
            SMTP_HOST: 'smtp.test.com',
            SMTP_PORT: 587,
            SMTP_USER: 'test',
            SMTP_PASS: 'test',
            SMTP_FROM: 'test@test.com',
            LIGDICASH_API_KEY: 'test-key',
            LIGDICASH_API_TOKEN: 'test-token',
            FRONTEND_URL: 'http://localhost:3001',
          })],
        }),
        ThrottlerModule.forRoot([{ ttl: 60000, limit: 1000 }]),
        {
          module: class TestPrismaModule {},
          global: true,
          providers: [{ provide: PrismaService, useValue: mockPrisma }],
          exports: [PrismaService],
        },
        AuthModule,
        UsersModule,
        CatalogueModule,
        VrModule,
        LearningModule,
        PaymentModule,
        B2bModule,
        MdmModule,
        InstructorModule,
        RolesModule,
        EmailModule,
      ],
      providers: [
        { provide: APP_GUARD, useClass: ThrottlerGuard },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    })
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();

    app = buildApp(moduleFixture);
    await app.init();
    authToken = getAuthToken();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockImplementation((args: any) => {
      if (args?.where?.id === 'test-user-id') {
        return Promise.resolve({
          id: 'test-user-id',
          email: 'admin@test.com',
          role: 'SUPER_ADMIN',
          nom: 'Admin',
          prenom: 'Test',
        });
      }
      return Promise.resolve(null);
    });
    mockEmailService.sendPasswordResetEmail.mockResolvedValue(undefined);
  });

  // ──────────────────────────────────────────────
  // AUTH
  // ──────────────────────────────────────────────

  describe('POST /api/v1/auth/register', () => {
    it('should register a user', () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({ id: 'new-user', email: 'new@test.com', nom: 'Doe', prenom: 'John', role: 'LEARNER' });

      return supertest(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'new@test.com', password: 'password123', nom: 'Doe', prenom: 'John' })
        .expect(201);
    });

    it('should return 409 if email exists', () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      return supertest(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'existing@test.com', password: 'password123', nom: 'D', prenom: 'J' })
        .expect(409);
    });

    it('should return 400 for invalid data', () => {
      return supertest(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email' })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 401 for wrong credentials', () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      return supertest(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'wrong@test.com', password: 'bad' })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should return success message (user found)', () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@test.com' });
      mockPrisma.user.update.mockResolvedValue({});

      return supertest(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'test@test.com' })
        .expect(201)
        .expect((res: any) => {
          expect(res.body.message).toBe('Si cet email existe, un lien de réinitialisation a été envoyé.');
        });
    });

    it('should return success message (user not found - privacy)', () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      return supertest(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'unknown@test.com' })
        .expect(201);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should return tokens when authenticated', () => {
      return supertest(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);
    });

    it('should return 401 without token', () => {
      return supertest(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .expect(401);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    it('should return profile when authenticated', () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'test-user-id', email: 'admin@test.com', nom: 'Admin', prenom: 'Test', telephone: null, avatar: null, role: 'SUPER_ADMIN', emailVerifiedAt: null, lastLoginAt: null, createdAt: new Date() });

      return supertest(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should return 401 without token', () => {
      return supertest(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .expect(401);
    });
  });

  // ──────────────────────────────────────────────
  // USERS
  // ──────────────────────────────────────────────

  describe('GET /api/v1/users', () => {
    it('should return paginated users', () => {
      mockPrisma.user.findMany.mockResolvedValue([{ id: 'u1', email: 'a@b.com', nom: 'A', prenom: 'B', role: 'LEARNER', createdAt: new Date() }]);
      mockPrisma.user.count.mockResolvedValue(1);

      return supertest(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res: any) => {
          expect(res.body.users).toHaveLength(1);
          expect(res.body.total).toBe(1);
        });
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return user', () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com', nom: 'A', prenom: 'B', telephone: null, avatar: null, role: 'LEARNER', createdAt: new Date(), lastLoginAt: null });

      return supertest(app.getHttpServer())
        .get('/api/v1/users/u1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should return 404 if not found', async () => {
      return supertest(app.getHttpServer())
        .get('/api/v1/users/unknown')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/users/:id', () => {
    it('should update user', () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com', role: 'SUPER_ADMIN', nom: 'A', prenom: 'B' });
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', email: 'a@b.com', nom: 'Updated', prenom: 'B', role: 'SUPER_ADMIN', updatedAt: new Date() });

      return supertest(app.getHttpServer())
        .patch('/api/v1/users/u1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nom: 'Updated' })
        .expect(200);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should soft delete user', () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'a@b.com', role: 'SUPER_ADMIN', nom: 'A', prenom: 'B' });
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', deletedAt: new Date() });

      return supertest(app.getHttpServer())
        .delete('/api/v1/users/u1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  // ──────────────────────────────────────────────
  // CATALOGUE
  // ──────────────────────────────────────────────

  describe('GET /api/v1/domains', () => {
    it('should return domains', () => {
      mockPrisma.domain.findMany.mockResolvedValue([{ id: 'd1', name: 'Dev', _count: { courses: 3 } }]);

      return supertest(app.getHttpServer())
        .get('/api/v1/domains')
        .expect(200)
        .expect((res: any) => {
          expect(res.body).toHaveLength(1);
        });
    });
  });

  describe('POST /api/v1/domains', () => {
    it('should create domain', () => {
      mockPrisma.domain.findUnique.mockResolvedValue(null);
      mockPrisma.domain.create.mockResolvedValue({ id: 'd1', name: 'Dev', slug: 'dev' });

      return supertest(app.getHttpServer())
        .post('/api/v1/domains')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Dev', slug: 'dev' })
        .expect(201);
    });
  });

  describe('GET /api/v1/domains/:id', () => {
    it('should return domain detail', () => {
      mockPrisma.domain.findUnique.mockResolvedValue({ id: 'd1', name: 'Dev', courses: [] });

      return supertest(app.getHttpServer())
        .get('/api/v1/domains/d1')
        .expect(200);
    });
  });

  describe('POST /api/v1/courses', () => {
    it('should create course', () => {
      mockPrisma.course.create.mockResolvedValue({ id: 'c1', title: 'Course', slug: 'course', domain: {}, createdBy: 'u1' });

      return supertest(app.getHttpServer())
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Course', domainId: 'd1' })
        .expect(201);
    });
  });

  describe('GET /api/v1/courses', () => {
    it('should return paginated courses', () => {
      mockPrisma.course.findMany.mockResolvedValue([{ id: 'c1', title: 'Course', domain: {}, creator: {}, _count: { modules: 0, enrollments: 0 } }]);
      mockPrisma.course.count.mockResolvedValue(1);

      return supertest(app.getHttpServer())
        .get('/api/v1/courses')
        .expect(200)
        .expect((res: any) => {
          expect(res.body.courses).toHaveLength(1);
        });
    });
  });

  describe('GET /api/v1/courses/:slug', () => {
    it('should return course by slug', () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'c1', slug: 'course', domain: {}, creator: {}, modules: [], reviews: [] });

      return supertest(app.getHttpServer())
        .get('/api/v1/courses/course')
        .expect(200);
    });
  });

  describe('PATCH /api/v1/courses/:id', () => {
    it('should update course', () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'c1' });
      mockPrisma.course.update.mockResolvedValue({ id: 'c1', title: 'Updated', domain: {} });

      return supertest(app.getHttpServer())
        .patch('/api/v1/courses/c1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(200);
    });
  });

  describe('DELETE /api/v1/courses/:id', () => {
    it('should unpublish course', () => {
      mockPrisma.course.update.mockResolvedValue({ id: 'c1', isPublished: false });

      return supertest(app.getHttpServer())
        .delete('/api/v1/courses/c1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('POST /api/v1/modules', () => {
    it('should create module', () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'c1' });
      mockPrisma.module.aggregate.mockResolvedValue({ _max: { order: 0 } });
      mockPrisma.module.create.mockResolvedValue({ id: 'm1', title: 'Module', type: 'VIDEO', order: 1, course: {} });

      return supertest(app.getHttpServer())
        .post('/api/v1/modules')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Module', type: 'VIDEO', courseId: 'c1' })
        .expect(201);
    });
  });

  // ──────────────────────────────────────────────
  // LEARNING
  // ──────────────────────────────────────────────

  describe('POST /api/v1/enrollments', () => {
    it('should enroll user', () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'c1' });
      mockPrisma.enrollment.findFirst.mockResolvedValue(null);
      mockPrisma.enrollment.create.mockResolvedValue({ id: 'e1', userId: 'u1', courseId: 'c1', course: { id: 'c1', title: 'Course' } });

      return supertest(app.getHttpServer())
        .post('/api/v1/enrollments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ courseId: 'c1' })
        .expect(201);
    });
  });

  describe('GET /api/v1/enrollments', () => {
    it('should return enrollments', () => {
      mockPrisma.enrollment.findMany.mockResolvedValue([]);

      return supertest(app.getHttpServer())
        .get('/api/v1/enrollments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('POST /api/v1/quiz/submit', () => {
    it('should submit quiz', () => {
      mockPrisma.quiz.findUnique.mockResolvedValue({ id: 'q1', passingScore: 50, questions: [{ id: 'q1', points: 1, correctAnswer: 'A' }] });
      mockPrisma.quizAttempt.create.mockResolvedValue({ id: 'a1' });

      return supertest(app.getHttpServer())
        .post('/api/v1/quiz/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ quizId: 'q1', answers: [{ questionId: 'q1', answer: 'A' }] })
        .expect(201);
    });
  });

  describe('POST /api/v1/certificates/:courseId', () => {
    it('should generate certificate', () => {
      mockPrisma.enrollment.findFirst.mockResolvedValue({ id: 'e1', status: 'COMPLETED' });
      mockPrisma.certificate.create.mockResolvedValue({ id: 'cert-1', certificateUid: 'uuid', verificationUrl: 'https://...', qrCodeHash: 'hash', user: {}, course: {} });

      return supertest(app.getHttpServer())
        .post('/api/v1/certificates/c1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);
    });
  });

  // ──────────────────────────────────────────────
  // PAYMENT
  // ──────────────────────────────────────────────

  describe('POST /api/v1/payments', () => {
    it('should create payment', () => {
      mockPrisma.payment.create.mockResolvedValue({ id: 'p1', transactionId: 'T1', amount: 5000, userId: 'u1' });

      return supertest(app.getHttpServer())
        .post('/api/v1/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ transactionId: 'T1', amount: 5000, provider: 'CINETPAY' })
        .expect(201);
    });
  });

  describe('GET /api/v1/payments/mine', () => {
    it('should return user payments', () => {
      mockPrisma.payment.findMany.mockResolvedValue([]);

      return supertest(app.getHttpServer())
        .get('/api/v1/payments/mine')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  // ──────────────────────────────────────────────
  // B2B
  // ──────────────────────────────────────────────

  describe('POST /api/v1/b2b/organizations', () => {
    it('should create organization', () => {
      mockPrisma.organization.create.mockResolvedValue({ id: 'o1', name: 'Org' });

      return supertest(app.getHttpServer())
        .post('/api/v1/b2b/organizations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Org', type: 'UNIVERSITY' })
        .expect(201);
    });
  });

  describe('GET /api/v1/b2b/organizations', () => {
    it('should list organizations', () => {
      mockPrisma.organization.findMany.mockResolvedValue([]);

      return supertest(app.getHttpServer())
        .get('/api/v1/b2b/organizations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  // ──────────────────────────────────────────────
  // MDM
  // ──────────────────────────────────────────────

  describe('POST /api/v1/mdm/headsets', () => {
    it('should create headset', () => {
      mockPrisma.vRHeadset.create.mockResolvedValue({ id: 'h1', serialNumber: 'SN-001' });

      return supertest(app.getHttpServer())
        .post('/api/v1/mdm/headsets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ organizationId: 'o1', serialNumber: 'SN-001', model: 'META_QUEST_3' })
        .expect(201);
    });
  });

  // ──────────────────────────────────────────────
  // INSTRUCTOR
  // ──────────────────────────────────────────────

  describe('GET /api/v1/instructor/profile', () => {
    it('should return instructor profile', () => {
      mockPrisma.instructorProfile.findUnique.mockResolvedValue({ id: 'p1', userId: 'u1', user: {} });

      return supertest(app.getHttpServer())
        .get('/api/v1/instructor/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('POST /api/v1/reviews', () => {
    it('should create review', () => {
      mockPrisma.courseReview.create.mockResolvedValue({ id: 'r1', courseId: 'c1', rating: 5, userId: 'u1', user: {} });

      return supertest(app.getHttpServer())
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ courseId: 'c1', rating: 5 })
        .expect(201);
    });
  });

  // ──────────────────────────────────────────────
  // VR
  // ──────────────────────────────────────────────

  describe('POST /api/v1/vr/scenes', () => {
    it('should create VR scene', () => {
      mockPrisma.module.findUnique.mockResolvedValue({ id: 'm1' });
      mockPrisma.vRScene.create.mockResolvedValue({ id: 's1', moduleId: 'm1', title: 'Scene' });

      return supertest(app.getHttpServer())
        .post('/api/v1/vr/scenes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ moduleId: 'm1', title: 'Scene' })
        .expect(201);
    });
  });

  // ──────────────────────────────────────────────
  // ROLES
  // ──────────────────────────────────────────────

  describe('GET /api/v1/roles/me', () => {
    it('should return user permissions', () => {
      mockPrisma.user.findUnique.mockResolvedValue({ role: 'SUPER_ADMIN' });

      return supertest(app.getHttpServer())
        .get('/api/v1/roles/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});
