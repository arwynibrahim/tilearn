"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _mdmcontroller = require("./mdm.controller");
const _mdmservice = require("./mdm.service");
const mockMdmService = {
    createHeadset: jest.fn(),
    getOrganizationHeadsets: jest.fn(),
    updateHeadsetStatus: jest.fn(),
    assignHeadset: jest.fn(),
    createChargingStation: jest.fn(),
    getOrganizationChargingStations: jest.fn()
};
describe('MdmController', ()=>{
    let controller;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _mdmcontroller.MdmController
            ],
            providers: [
                {
                    provide: _mdmservice.MdmService,
                    useValue: mockMdmService
                }
            ]
        }).compile();
        controller = module.get(_mdmcontroller.MdmController);
        jest.clearAllMocks();
    });
    it('createHeadset', async ()=>{
        const dto = {
            organizationId: 'o1',
            serialNumber: 'SN-001',
            model: 'META_QUEST_3'
        };
        mockMdmService.createHeadset.mockResolvedValue({
            id: 'h1'
        });
        expect(await controller.createHeadset(dto)).toEqual({
            id: 'h1'
        });
        expect(mockMdmService.createHeadset).toHaveBeenCalledWith(dto);
    });
    it('getOrganizationHeadsets', async ()=>{
        mockMdmService.getOrganizationHeadsets.mockResolvedValue([]);
        expect(await controller.getOrganizationHeadsets('org-1')).toEqual([]);
        expect(mockMdmService.getOrganizationHeadsets).toHaveBeenCalledWith('org-1');
    });
    it('updateHeadsetStatus', async ()=>{
        mockMdmService.updateHeadsetStatus.mockResolvedValue({
            id: 'h1',
            status: 'IN_USE'
        });
        const result = await controller.updateHeadsetStatus('h1', 'IN_USE', 80);
        expect(mockMdmService.updateHeadsetStatus).toHaveBeenCalledWith('h1', 'IN_USE', 80);
        expect(result).toEqual({
            id: 'h1',
            status: 'IN_USE'
        });
    });
    it('assignHeadset', async ()=>{
        mockMdmService.assignHeadset.mockResolvedValue({
            id: 'h1',
            assignedUserId: 'u1'
        });
        expect(await controller.assignHeadset('h1', 'u1')).toEqual({
            id: 'h1',
            assignedUserId: 'u1'
        });
        expect(mockMdmService.assignHeadset).toHaveBeenCalledWith('h1', 'u1');
    });
    it('createChargingStation', async ()=>{
        const data = {
            organizationId: 'o1',
            portsTotal: 10,
            portsAvailable: 10
        };
        mockMdmService.createChargingStation.mockResolvedValue({
            id: 'cs1'
        });
        expect(await controller.createChargingStation(data)).toEqual({
            id: 'cs1'
        });
        expect(mockMdmService.createChargingStation).toHaveBeenCalledWith(data);
    });
    it('getOrganizationChargingStations', async ()=>{
        mockMdmService.getOrganizationChargingStations.mockResolvedValue([]);
        expect(await controller.getOrganizationChargingStations('org-1')).toEqual([]);
        expect(mockMdmService.getOrganizationChargingStations).toHaveBeenCalledWith('org-1');
    });
});

//# sourceMappingURL=mdm.controller.spec.js.map