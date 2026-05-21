import { SetMetadata } from '@nestjs/common';
import { PermissionName } from '../../modules/roles/permissions';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: PermissionName[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
