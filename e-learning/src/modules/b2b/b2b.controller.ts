import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { B2bService } from './b2b.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { CreateLicenseDto } from './dto/create-license.dto';
import { CreateLearningPathDto } from './dto/create-learningpath.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permissions } from '../roles/permissions';
import { Role } from '../../common/enums/role.enum';

@ApiTags('B2B')
@Controller('b2b')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class B2bController {
  constructor(private b2bService: B2bService) {}

  @Post('organizations')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.ORGANIZATION_CREATE)
  @ApiOperation({ summary: 'Créer une organisation' })
  createOrganization(@Body() dto: CreateOrganizationDto) {
    return this.b2bService.createOrganization(dto);
  }

  @Get('organizations')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  @RequirePermissions(Permissions.ORGANIZATION_READ)
  @ApiOperation({ summary: 'Liste des organisations' })
  findAllOrganizations(@CurrentUser('memberships') memberships: any) {
    return this.b2bService.findAllOrganizations(memberships);
  }

  @Get('organizations/:orgId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  @RequirePermissions(Permissions.ORGANIZATION_READ)
  @ApiOperation({ summary: 'Détail d\'une organisation' })
  findOneOrganization(
    @Param('orgId') orgId: string,
    @CurrentUser('memberships') memberships: any,
  ) {
    return this.b2bService.findOneOrganization(orgId, memberships);
  }

  @Patch('organizations/:orgId')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.ORGANIZATION_UPDATE)
  @ApiOperation({ summary: 'Modifier une organisation' })
  updateOrganization(@Param('orgId') orgId: string, @Body() dto: Partial<CreateOrganizationDto>) {
    return this.b2bService.updateOrganization(orgId, dto);
  }

  @Delete('organizations/:orgId')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.ORGANIZATION_DELETE)
  @ApiOperation({ summary: 'Supprimer une organisation' })
  removeOrganization(@Param('orgId') orgId: string) {
    return this.b2bService.removeOrganization(orgId);
  }

  @Post('licenses')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.LICENSE_CREATE)
  @ApiOperation({ summary: 'Créer une licence' })
  createLicense(@Body() dto: CreateLicenseDto) {
    return this.b2bService.createLicense(dto);
  }

  @Patch('licenses/:id')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.LICENSE_CREATE)
  @ApiOperation({ summary: 'Modifier une licence' })
  updateLicense(@Param('id') id: string, @Body() dto: Partial<CreateLicenseDto>) {
    return this.b2bService.updateLicense(id, dto);
  }

  @Delete('licenses/:id')
  @Roles(Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.LICENSE_CREATE)
  @ApiOperation({ summary: 'Supprimer une licence' })
  removeLicense(@Param('id') id: string) {
    return this.b2bService.removeLicense(id);
  }

  @Post('licenses/:licenseId/assign/:userId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  @RequirePermissions(Permissions.LICENSE_ASSIGN)
  @ApiOperation({ summary: 'Assigner une licence à un utilisateur' })
  assignLicense(
    @Param('licenseId') licenseId: string,
    @Param('userId') userId: string,
    @CurrentUser('id') assignedBy: string,
    @CurrentUser('memberships') memberships: any,
  ) {
    return this.b2bService.assignLicense(licenseId, userId, assignedBy, memberships);
  }

  @Post('licenses/revoke/:assignmentId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  @RequirePermissions(Permissions.LICENSE_REVOKE)
  @ApiOperation({ summary: 'Révoquer une assignation de licence' })
  revokeLicense(
    @Param('assignmentId') assignmentId: string,
    @CurrentUser('memberships') memberships: any,
  ) {
    return this.b2bService.revokeLicense(assignmentId, memberships);
  }

  @Get('organizations/:orgId/licenses')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  @RequirePermissions(Permissions.LICENSE_READ)
  @ApiOperation({ summary: 'Licences d\'une organisation' })
  getOrganizationLicenses(@Param('orgId') orgId: string) {
    return this.b2bService.getOrganizationLicenses(orgId);
  }

  @Post('learning-paths')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  @RequirePermissions(Permissions.LEARNINGPATH_CREATE)
  @ApiOperation({ summary: 'Créer un parcours d\'apprentissage' })
  createLearningPath(@Body() dto: CreateLearningPathDto) {
    return this.b2bService.createLearningPath(dto);
  }

  @Get('organizations/:orgId/learning-paths')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  @RequirePermissions(Permissions.LEARNINGPATH_READ)
  @ApiOperation({ summary: 'Parcours d\'apprentissage d\'une organisation' })
  getOrganizationLearningPaths(@Param('orgId') orgId: string) {
    return this.b2bService.getOrganizationLearningPaths(orgId);
  }

  @Patch('learning-paths/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  @RequirePermissions(Permissions.LEARNINGPATH_UPDATE)
  @ApiOperation({ summary: 'Modifier un parcours d\'apprentissage' })
  updateLearningPath(@Param('id') id: string, @Body() dto: Partial<CreateLearningPathDto>) {
    return this.b2bService.updateLearningPath(id, dto);
  }

  @Delete('learning-paths/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  @RequirePermissions(Permissions.LEARNINGPATH_DELETE)
  @ApiOperation({ summary: 'Supprimer un parcours d\'apprentissage' })
  removeLearningPath(@Param('id') id: string) {
    return this.b2bService.removeLearningPath(id);
  }
}
