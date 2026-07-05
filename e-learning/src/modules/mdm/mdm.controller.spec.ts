import { Test, TestingModule } from '@nestjs/testing';
import { MdmController } from './mdm.controller';
import { MdmService } from './mdm.service';

const mockMdmService = {
  createHeadset: jest.fn(),
  getOrganizationHeadsets: jest.fn(),
  updateHeadsetStatus: jest.fn(),
  assignHeadset: jest.fn(),
  removeHeadset: jest.fn(),
  createChargingStation: jest.fn(),
  getOrganizationChargingStations: jest.fn(),
  removeChargingStation: jest.fn(),
};

describe('MdmController', () => {
  let controller: MdmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MdmController],
      providers: [{ provide: MdmService, useValue: mockMdmService }],
    }).compile();

    controller = module.get<MdmController>(MdmController);
    jest.clearAllMocks();
  });

  it('createHeadset', async () => {
    const dto = { organizationId: 'o1', serialNumber: 'SN-001', model: 'META_QUEST_3' as const };
    mockMdmService.createHeadset.mockResolvedValue({ id: 'h1' });
    expect(await controller.createHeadset(dto, undefined)).toEqual({ id: 'h1' });
    expect(mockMdmService.createHeadset).toHaveBeenCalledWith(dto, undefined);
  });

  it('getOrganizationHeadsets', async () => {
    mockMdmService.getOrganizationHeadsets.mockResolvedValue([]);
    expect(await controller.getOrganizationHeadsets('org-1')).toEqual([]);
    expect(mockMdmService.getOrganizationHeadsets).toHaveBeenCalledWith('org-1');
  });

  it('updateHeadsetStatus', async () => {
    mockMdmService.updateHeadsetStatus.mockResolvedValue({ id: 'h1', status: 'IN_USE' });
    const result = await controller.updateHeadsetStatus('h1', 'IN_USE', 80, undefined);
    expect(mockMdmService.updateHeadsetStatus).toHaveBeenCalledWith('h1', 'IN_USE', 80, undefined);
    expect(result).toEqual({ id: 'h1', status: 'IN_USE' });
  });

  it('assignHeadset', async () => {
    mockMdmService.assignHeadset.mockResolvedValue({ id: 'h1', assignedUserId: 'u1' });
    expect(await controller.assignHeadset('h1', 'u1', undefined)).toEqual({ id: 'h1', assignedUserId: 'u1' });
    expect(mockMdmService.assignHeadset).toHaveBeenCalledWith('h1', 'u1', undefined);
  });

  it('createChargingStation', async () => {
    const data = { organizationId: 'o1', portsTotal: 10, portsAvailable: 10 };
    mockMdmService.createChargingStation.mockResolvedValue({ id: 'cs1' });
    expect(await controller.createChargingStation(data, undefined)).toEqual({ id: 'cs1' });
    expect(mockMdmService.createChargingStation).toHaveBeenCalledWith(data, undefined);
  });

  it('getOrganizationChargingStations', async () => {
    mockMdmService.getOrganizationChargingStations.mockResolvedValue([]);
    expect(await controller.getOrganizationChargingStations('org-1')).toEqual([]);
    expect(mockMdmService.getOrganizationChargingStations).toHaveBeenCalledWith('org-1');
  });
});
