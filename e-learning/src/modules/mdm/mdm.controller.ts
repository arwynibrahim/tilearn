import {
  Controller, Get, Post, Patch, Delete, Param, Body, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MdmService } from './mdm.service';
import { CreateVRHeadsetDto } from './dto/create-vrheadset.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permissions } from '../roles/permissions';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('MDM')
@Controller('mdm')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
@ApiBearerAuth()
export class MdmController {
  constructor(private mdmService: MdmService) {}

  @Post('headsets')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @RequirePermissions(Permissions.VRHEADSET_CREATE)
  @ApiOperation({ summary: 'Ajouter un casque VR' })
  createHeadset(
    @Body() dto: CreateVRHeadsetDto,
    @CurrentUser('memberships') memberships: any,
  ) {
    return this.mdmService.createHeadset(dto, memberships);
  }

  @Get('organizations/:orgId/headsets')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @RequirePermissions(Permissions.VRHEADSET_READ)
  @ApiOperation({ summary: 'Casques VR d\'une organisation' })
  getOrganizationHeadsets(@Param('orgId') orgId: string) {
    return this.mdmService.getOrganizationHeadsets(orgId);
  }

  @Patch('headsets/:id/status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @RequirePermissions(Permissions.VRHEADSET_UPDATE)
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un casque' })
  updateHeadsetStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('batteryLevel') batteryLevel: number | undefined,
    @CurrentUser('memberships') memberships: any,
  ) {
    return this.mdmService.updateHeadsetStatus(id, status, batteryLevel, memberships);
  }

  @Post('headsets/:id/assign/:userId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @RequirePermissions(Permissions.VRHEADSET_UPDATE)
  @ApiOperation({ summary: 'Assigner un casque à un utilisateur' })
  assignHeadset(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser('memberships') memberships: any,
  ) {
    return this.mdmService.assignHeadset(id, userId, memberships);
  }

  @Delete('headsets/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @RequirePermissions(Permissions.VRHEADSET_DELETE)
  @ApiOperation({ summary: 'Supprimer un casque VR' })
  removeHeadset(
    @Param('id') id: string,
    @CurrentUser('memberships') memberships: any,
  ) {
    return this.mdmService.removeHeadset(id, memberships);
  }

  @Post('charging-stations')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @RequirePermissions(Permissions.VRHEADSET_UPDATE)
  @ApiOperation({ summary: 'Créer une station de charge' })
  createChargingStation(
    @Body() data: any,
    @CurrentUser('memberships') memberships: any,
  ) {
    return this.mdmService.createChargingStation(data, memberships);
  }

  @Get('organizations/:orgId/charging-stations')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @RequirePermissions(Permissions.VRHEADSET_READ)
  @ApiOperation({ summary: 'Stations de charge d\'une organisation' })
  getOrganizationChargingStations(@Param('orgId') orgId: string) {
    return this.mdmService.getOrganizationChargingStations(orgId);
  }

  @Delete('charging-stations/:id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @RequirePermissions(Permissions.VRHEADSET_DELETE)
  @ApiOperation({ summary: 'Supprimer une station de charge' })
  removeChargingStation(
    @Param('id') id: string,
    @CurrentUser('memberships') memberships: any,
  ) {
    return this.mdmService.removeChargingStation(id, memberships);
  }
}
