import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VrService } from './vr.service';
import { CreateVRSceneDto } from './dto/create-vrscene.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permissions } from '../roles/permissions';
import { Role } from '../../common/enums/role.enum';

@ApiTags('VR')
@Controller('vr')
export class VrController {
  constructor(private vrService: VrService) {}

  @Post('scenes')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(Role.CREATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.VR_SCENE_CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une scène VR' })
  createScene(@Body() dto: CreateVRSceneDto) {
    return this.vrService.createScene(dto);
  }

  @Get('modules/:moduleId/scene')
  @ApiOperation({ summary: 'Obtenir la scène VR d\'un module' })
  findSceneByModule(@Param('moduleId') moduleId: string) {
    return this.vrService.findSceneByModule(moduleId);
  }

  @Get('scenes/:id')
  @ApiOperation({ summary: 'Détail d\'une scène VR' })
  findOneScene(@Param('id') id: string) {
    return this.vrService.findOneScene(id);
  }

  @Patch('scenes/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(Role.CREATOR, Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.VR_SCENE_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modifier une scène VR' })
  updateScene(@Param('id') id: string, @Body() dto: Partial<CreateVRSceneDto>) {
    return this.vrService.updateScene(id, dto);
  }

  @Delete('scenes/:id')
  @UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @RequirePermissions(Permissions.VR_SCENE_UPDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une scène VR' })
  removeScene(@Param('id') id: string) {
    return this.vrService.removeScene(id);
  }
}
