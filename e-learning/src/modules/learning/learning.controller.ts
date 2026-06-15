import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LearningService } from './learning.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permissions } from '../roles/permissions';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Learning')
@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class LearningController {
  constructor(private learningService: LearningService) {}

  // ─── Inscriptions ─────────────────────────────────────────

  @Post('enrollments')
  @RequirePermissions(Permissions.ENROLLMENT_CREATE)
  @ApiOperation({ summary: 'S\'inscrire à un cours' })
  enroll(@Body() dto: CreateEnrollmentDto, @CurrentUser('id') userId: string) {
    return this.learningService.enroll(dto, userId);
  }

  @Get('enrollments')
  @RequirePermissions(Permissions.ENROLLMENT_READ)
  @ApiOperation({ summary: 'Mes inscriptions' })
  getUserEnrollments(@CurrentUser('id') userId: string) {
    return this.learningService.getUserEnrollments(userId);
  }

  // ─── ADMIN: Inscriptions ──────────────────────────────────

  @Get('admin/enrollments')
  @Roles(Role.ADMIN_INSTITUTION, Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.ENROLLMENT_READ)
  @ApiOperation({ summary: 'ADMIN: Toutes les inscriptions' })
  getAllEnrollments(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('courseId') courseId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
  ) {
    return this.learningService.getAllEnrollments(+page, +limit, { courseId, userId, status });
  }

  @Get('admin/enrollments/:id')
  @Roles(Role.ADMIN_INSTITUTION, Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.ENROLLMENT_READ)
  @ApiOperation({ summary: 'ADMIN: Détail d\'une inscription' })
  getEnrollmentById(@Param('id') id: string) {
    return this.learningService.getEnrollmentById(id);
  }

  @Patch('admin/enrollments/:id/status')
  @Roles(Role.ADMIN_INSTITUTION, Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.ENROLLMENT_UPDATE)
  @ApiOperation({ summary: 'ADMIN: Modifier le statut d\'une inscription' })
  updateEnrollmentStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.learningService.updateEnrollmentStatus(id, status);
  }

  // ─── Progression ──────────────────────────────────────────

  @Post('progress/:moduleId')
  @RequirePermissions(Permissions.PROGRESS_UPDATE)
  @ApiOperation({ summary: 'Mettre à jour la progression d\'un module' })
  updateProgress(
    @CurrentUser('id') userId: string,
    @Param('moduleId') moduleId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.learningService.updateProgress(userId, moduleId, dto);
  }

  @Get('progress/:courseId')
  @RequirePermissions(Permissions.PROGRESS_READ)
  @ApiOperation({ summary: 'Progression dans un cours' })
  getUserProgress(@CurrentUser('id') userId: string, @Param('courseId') courseId: string) {
    return this.learningService.getUserProgress(userId, courseId);
  }

  // ─── ADMIN: Progression ───────────────────────────────────

  @Get('admin/progress')
  @Roles(Role.ADMIN_INSTITUTION, Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.PROGRESS_READ)
  @ApiOperation({ summary: 'ADMIN: Toutes les progressions' })
  getAllProgress(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('userId') userId?: string,
    @Query('courseId') courseId?: string,
    @Query('status') status?: string,
  ) {
    return this.learningService.getAllProgress(+page, +limit, { userId, courseId, status });
  }

  // ─── Quiz ─────────────────────────────────────────────────

  @Get('quiz/:quizId')
  @RequirePermissions(Permissions.QUIZ_READ)
  @ApiOperation({ summary: 'Détail d\'un quiz (questions)' })
  getQuiz(@Param('quizId') quizId: string) {
    return this.learningService.getQuiz(quizId);
  }

  @Post('quiz/submit')
  @RequirePermissions(Permissions.QUIZ_ATTEMPT)
  @ApiOperation({ summary: 'Soumettre un quiz' })
  submitQuiz(@Body() dto: SubmitQuizDto, @CurrentUser('id') userId: string) {
    return this.learningService.submitQuiz(dto, userId);
  }

  @Get('quiz/:quizId/attempts')
  @RequirePermissions(Permissions.QUIZ_READ)
  @ApiOperation({ summary: 'Mes tentatives pour un quiz' })
  getUserQuizAttempts(@CurrentUser('id') userId: string, @Param('quizId') quizId: string) {
    return this.learningService.getUserQuizAttempts(userId, quizId);
  }

  // ─── Certificats ──────────────────────────────────────────

  @Post('certificates/:courseId')
  @RequirePermissions(Permissions.CERTIFICATE_CREATE)
  @ApiOperation({ summary: 'Générer un certificat' })
  generateCertificate(@CurrentUser('id') userId: string, @Param('courseId') courseId: string) {
    return this.learningService.generateCertificate(userId, courseId);
  }

  @Get('certificates')
  @RequirePermissions(Permissions.CERTIFICATE_READ)
  @ApiOperation({ summary: 'Mes certificats' })
  getUserCertificates(@CurrentUser('id') userId: string) {
    return this.learningService.getUserCertificates(userId);
  }

  @Get('certificates/verify/:uid')
  @ApiOperation({ summary: 'Vérifier un certificat par UID' })
  verifyCertificate(@Param('uid') uid: string) {
    return this.learningService.verifyCertificate(uid);
  }

  // ─── ADMIN: Certificats ───────────────────────────────────

  @Get('admin/certificates')
  @Roles(Role.ADMIN_INSTITUTION, Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.CERTIFICATE_READ)
  @ApiOperation({ summary: 'ADMIN: Tous les certificats' })
  getAllCertificates(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.learningService.getAllCertificates(+page, +limit);
  }

  @Patch('admin/certificates/:id/revoke')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.CERTIFICATE_DELETE)
  @ApiOperation({ summary: 'ADMIN: Révoquer un certificat' })
  revokeCertificate(@Param('id') id: string) {
    return this.learningService.revokeCertificate(id);
  }
}
