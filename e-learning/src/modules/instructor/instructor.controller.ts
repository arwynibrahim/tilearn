import {
  Controller, Get, Post, Patch, Param, Body, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InstructorService } from './instructor.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permissions } from '../roles/permissions';

@ApiTags('Instructor')
@Controller()
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class InstructorController {
  constructor(private instructorService: InstructorService) {}

  @Get('instructor/profile')
  @RequirePermissions(Permissions.INSTRUCTOR_READ)
  @ApiOperation({ summary: 'Mon profil instructeur' })
  getProfile(@CurrentUser('id') userId: string) {
    return this.instructorService.getProfile(userId);
  }

  @Patch('instructor/profile')
  @RequirePermissions(Permissions.INSTRUCTOR_UPDATE)
  @ApiOperation({ summary: 'Mettre à jour mon profil instructeur' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() data: { bio?: string; expertiseAreas?: string[]; bankAccountInfo?: string; taxId?: string },
  ) {
    return this.instructorService.updateProfile(userId, data);
  }

  @Get('instructor/courses')
  @RequirePermissions(Permissions.INSTRUCTOR_READ)
  @ApiOperation({ summary: 'Mes cours en tant qu\'instructeur' })
  getInstructorCourses(@CurrentUser('id') userId: string) {
    return this.instructorService.getInstructorCourses(userId);
  }

  @Get('instructor/stats')
  @RequirePermissions(Permissions.INSTRUCTOR_READ)
  @ApiOperation({ summary: 'Mes statistiques instructeur' })
  getInstructorStats(@CurrentUser('id') userId: string) {
    return this.instructorService.getInstructorStats(userId);
  }

  // ─── Avis publics ───────────────────────────────────────────

  @Post('reviews')
  @RequirePermissions(Permissions.REVIEW_CREATE)
  @ApiOperation({ summary: 'Ajouter un avis sur un cours' })
  createReview(@Body() dto: CreateReviewDto, @CurrentUser('id') userId: string) {
    return this.instructorService.createReview(dto, userId);
  }

  @Get('courses/:courseId/reviews')
  @RequirePermissions(Permissions.REVIEW_READ)
  @ApiOperation({ summary: 'Avis d\'un cours' })
  getCourseReviews(@Param('courseId') courseId: string) {
    return this.instructorService.getCourseReviews(courseId);
  }
}
