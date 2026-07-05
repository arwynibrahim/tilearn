import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CatalogueService } from './catalogue.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CreateDomainDto } from './dto/create-domain.dto';
import { CreateModuleDto } from './dto/create-module.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permissions } from '../roles/permissions';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Catalogue')
@Controller()
export class CatalogueController {
  constructor(private catalogueService: CatalogueService) {}

  // ─── Domaines ─────────────────────────────────────────────

  @Post('domains')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.DOMAIN_CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un domaine' })
  createDomain(@Body() dto: CreateDomainDto) {
    return this.catalogueService.createDomain(dto);
  }

  @Get('domains')
  @ApiOperation({ summary: 'Liste des domaines' })
  findAllDomains() {
    return this.catalogueService.findAllDomains();
  }

  @Get('domains/:id')
  @ApiOperation({ summary: "Détail d'un domaine avec ses cours" })
  findOneDomain(@Param('id') id: string) {
    return this.catalogueService.findOneDomain(id);
  }

  @Patch('domains/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.DOMAIN_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un domaine' })
  updateDomain(@Param('id') id: string, @Body() dto: Partial<CreateDomainDto>) {
    return this.catalogueService.updateDomain(id, dto);
  }

  @Delete('domains/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.DOMAIN_DELETE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un domaine' })
  removeDomain(@Param('id') id: string) {
    return this.catalogueService.removeDomain(id);
  }

  // ─── Cours ─────────────────────────────────────────────────

  @Post('courses')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(Role.CREATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.COURSE_CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un cours' })
  createCourse(@Body() dto: CreateCourseDto, @CurrentUser('id') userId: string) {
    return this.catalogueService.createCourse(dto, userId);
  }

  @Get('admin/courses')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  @RequirePermissions(Permissions.COURSE_READ)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'ADMIN: cours scopés par organisation' })
  findAdminCourses(@CurrentUser('memberships') memberships: any) {
    return this.catalogueService.findAdminCourses(memberships);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Liste des cours publiés (catalogue global)' })
  findAllCourses(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('domainId') domainId?: string,
    @Query('level') level?: string,
  ) {
    return this.catalogueService.findAllCourses(+page, +limit, { domainId, level });
  }

  @Get('courses/:slug')
  @ApiOperation({ summary: "Détail d'un cours par slug" })
  findOneCourse(@Param('slug') slug: string) {
    return this.catalogueService.findOneCourse(slug);
  }

  @Patch('courses/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(Role.CREATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.COURSE_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un cours' })
  updateCourse(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('memberships') memberships: Array<{ role: Role }>,
  ) {
    const isAdmin = memberships?.some((m) => m.role === Role.ADMIN || m.role === Role.SUPER_ADMIN);
    const effectiveRole = isAdmin ? Role.ADMIN : Role.CREATOR;
    return this.catalogueService.updateCourse(id, dto, userId, effectiveRole);
  }

  @Delete('courses/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.COURSE_DELETE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dépublier un cours' })
  removeCourse(@Param('id') id: string) {
    return this.catalogueService.removeCourse(id);
  }

  // ─── Modules ───────────────────────────────────────────────

  @Post('modules')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(Role.CREATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.MODULE_CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un module' })
  createModule(
    @Body() dto: CreateModuleDto,
    @CurrentUser('id') userId: string,
    @CurrentUser('memberships') memberships: Array<{ role: Role }>,
  ) {
    const isAdmin = memberships?.some((m) => m.role === Role.ADMIN || m.role === Role.SUPER_ADMIN);
    const effectiveRole = isAdmin ? Role.ADMIN : Role.CREATOR;
    return this.catalogueService.createModule(dto, userId, effectiveRole);
  }

  @Get('courses/:courseId/modules')
  @ApiOperation({ summary: "Modules d'un cours" })
  findModulesByCourse(@Param('courseId') courseId: string) {
    return this.catalogueService.findModulesByCourse(courseId);
  }

  @Patch('modules/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(Role.CREATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.MODULE_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier un module' })
  updateModule(
    @Param('id') id: string,
    @Body() dto: Partial<CreateModuleDto>,
    @CurrentUser('id') userId: string,
    @CurrentUser('memberships') memberships: Array<{ role: Role }>,
  ) {
    const isAdmin = memberships?.some((m) => m.role === Role.ADMIN || m.role === Role.SUPER_ADMIN);
    const effectiveRole = isAdmin ? Role.ADMIN : Role.CREATOR;
    return this.catalogueService.updateModule(id, dto, userId, effectiveRole);
  }

  @Delete('modules/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.MODULE_DELETE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un module' })
  removeModule(@Param('id') id: string) {
    return this.catalogueService.removeModule(id);
  }
}
