import {
  Controller, Get, Post, Param, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { Permissions } from './permissions';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Role as RoleEnum } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Roles')
@Controller('roles')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get('permissions')
  @Roles(RoleEnum.SUPER_ADMIN)
  @RequirePermissions(Permissions.ROLE_MANAGE)
  @ApiOperation({ summary: 'Toutes les permissions (groupées)' })
  getAllPermissions() {
    return this.rolesService.getAllPermissions();
  }

  @Post('sync')
  @Roles(RoleEnum.SUPER_ADMIN)
  @RequirePermissions(Permissions.ROLE_MANAGE)
  @ApiOperation({ summary: 'Synchroniser les permissions en base' })
  syncPermissions() {
    return this.rolesService.syncPermissionsToDb();
  }

  @Get('user/:userId')
  @Roles(RoleEnum.SUPER_ADMIN)
  @RequirePermissions(Permissions.ROLE_MANAGE)
  @ApiOperation({ summary: 'Permissions d\'un utilisateur' })
  getUserPermissions(@Param('userId') userId: string) {
    return this.rolesService.getUserWithPermissions(userId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Mes permissions' })
  getMyPermissions(@CurrentUser('id') userId: string) {
    return this.rolesService.getUserPermissions(userId);
  }
}
