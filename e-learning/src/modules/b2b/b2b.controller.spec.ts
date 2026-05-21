import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationType, LicensePlan } from '@prisma/client';
import { B2bController } from './b2b.controller';
import { B2bService } from './b2b.service';

const mockB2bService = {
  createOrganization: jest.fn(),
  findAllOrganizations: jest.fn(),
  findOneOrganization: jest.fn(),
  createLicense: jest.fn(),
  assignLicense: jest.fn(),
  revokeLicense: jest.fn(),
  getOrganizationLicenses: jest.fn(),
  createLearningPath: jest.fn(),
  getOrganizationLearningPaths: jest.fn(),
};

describe('B2bController', () => {
  let controller: B2bController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [B2bController],
      providers: [{ provide: B2bService, useValue: mockB2bService }],
    }).compile();

    controller = module.get<B2bController>(B2bController);
    jest.clearAllMocks();
  });

  it('createOrganization', async () => {
    const dto = { name: 'Org', type: OrganizationType.UNIVERSITY };
    mockB2bService.createOrganization.mockResolvedValue({ id: 'o1' });
    expect(await controller.createOrganization(dto)).toEqual({ id: 'o1' });
    expect(mockB2bService.createOrganization).toHaveBeenCalledWith(dto);
  });

  it('findAllOrganizations', async () => {
    mockB2bService.findAllOrganizations.mockResolvedValue([]);
    expect(await controller.findAllOrganizations()).toEqual([]);
  });

  it('findOneOrganization', async () => {
    mockB2bService.findOneOrganization.mockResolvedValue({ id: 'o1' });
    expect(await controller.findOneOrganization('o1')).toEqual({ id: 'o1' });
    expect(mockB2bService.findOneOrganization).toHaveBeenCalledWith('o1');
  });

  it('createLicense', async () => {
    const dto = { organizationId: 'o1', plan: LicensePlan.ENTERPRISE_100, quantity: 10, startDate: '2025-01-01', endDate: '2025-12-31' };
    mockB2bService.createLicense.mockResolvedValue({ id: 'l1' });
    expect(await controller.createLicense(dto)).toEqual({ id: 'l1' });
    expect(mockB2bService.createLicense).toHaveBeenCalledWith(dto);
  });

  it('assignLicense', async () => {
    mockB2bService.assignLicense.mockResolvedValue({ id: 'a1' });
    expect(await controller.assignLicense('lic-1', 'user-1', 'admin-1')).toEqual({ id: 'a1' });
    expect(mockB2bService.assignLicense).toHaveBeenCalledWith('lic-1', 'user-1', 'admin-1');
  });

  it('revokeLicense', async () => {
    mockB2bService.revokeLicense.mockResolvedValue({ id: 'a1', revokedAt: new Date() });
    const result = await controller.revokeLicense('assign-1');
    expect(mockB2bService.revokeLicense).toHaveBeenCalledWith('assign-1');
    expect(result.revokedAt).toBeDefined();
  });

  it('getOrganizationLicenses', async () => {
    mockB2bService.getOrganizationLicenses.mockResolvedValue([]);
    expect(await controller.getOrganizationLicenses('org-1')).toEqual([]);
    expect(mockB2bService.getOrganizationLicenses).toHaveBeenCalledWith('org-1');
  });

  it('createLearningPath', async () => {
    const dto = { organizationId: 'o1', title: 'Path', courses: [{ courseId: 'c1' }] };
    mockB2bService.createLearningPath.mockResolvedValue({ id: 'lp1' });
    expect(await controller.createLearningPath(dto)).toEqual({ id: 'lp1' });
    expect(mockB2bService.createLearningPath).toHaveBeenCalledWith(dto);
  });

  it('getOrganizationLearningPaths', async () => {
    mockB2bService.getOrganizationLearningPaths.mockResolvedValue([]);
    expect(await controller.getOrganizationLearningPaths('org-1')).toEqual([]);
    expect(mockB2bService.getOrganizationLearningPaths).toHaveBeenCalledWith('org-1');
  });
});
