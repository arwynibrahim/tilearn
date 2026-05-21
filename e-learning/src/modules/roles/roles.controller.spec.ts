import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

const mockRolesService = {
  getAllPermissions: jest.fn(),
  syncPermissionsToDb: jest.fn(),
  getUserWithPermissions: jest.fn(),
  getUserPermissions: jest.fn(),
};

describe('RolesController', () => {
  let controller: RolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [{ provide: RolesService, useValue: mockRolesService }],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    jest.clearAllMocks();
  });

  it('getAllPermissions', async () => {
    mockRolesService.getAllPermissions.mockResolvedValue({ USER: [] });
    const result = await controller.getAllPermissions();
    expect(mockRolesService.getAllPermissions).toHaveBeenCalled();
    expect(result).toEqual({ USER: [] });
  });

  it('syncPermissions', async () => {
    mockRolesService.syncPermissionsToDb.mockResolvedValue({ message: 'Permissions synchronisées' });
    const result = await controller.syncPermissions();
    expect(mockRolesService.syncPermissionsToDb).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Permissions synchronisées' });
  });

  it('getUserPermissions', async () => {
    mockRolesService.getUserWithPermissions.mockResolvedValue({ id: 'u1', permissions: [] });
    const result = await controller.getUserPermissions('u1');
    expect(mockRolesService.getUserWithPermissions).toHaveBeenCalledWith('u1');
    expect(result).toEqual({ id: 'u1', permissions: [] });
  });

  it('getMyPermissions', async () => {
    mockRolesService.getUserPermissions.mockResolvedValue(['user:read']);
    const result = await controller.getMyPermissions('user-1');
    expect(mockRolesService.getUserPermissions).toHaveBeenCalledWith('user-1');
    expect(result).toEqual(['user:read']);
  });
});
