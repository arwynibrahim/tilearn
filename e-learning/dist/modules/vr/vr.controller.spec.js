"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _vrcontroller = require("./vr.controller");
const _vrservice = require("./vr.service");
const mockVrService = {
    createScene: jest.fn(),
    findSceneByModule: jest.fn(),
    findOneScene: jest.fn(),
    updateScene: jest.fn()
};
describe('VrController', ()=>{
    let controller;
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            controllers: [
                _vrcontroller.VrController
            ],
            providers: [
                {
                    provide: _vrservice.VrService,
                    useValue: mockVrService
                }
            ]
        }).compile();
        controller = module.get(_vrcontroller.VrController);
        jest.clearAllMocks();
    });
    it('createScene', async ()=>{
        const dto = {
            moduleId: 'm1',
            title: 'Scene'
        };
        mockVrService.createScene.mockResolvedValue({
            id: 's1'
        });
        expect(await controller.createScene(dto)).toEqual({
            id: 's1'
        });
        expect(mockVrService.createScene).toHaveBeenCalledWith(dto);
    });
    it('findSceneByModule', async ()=>{
        mockVrService.findSceneByModule.mockResolvedValue({
            id: 's1'
        });
        expect(await controller.findSceneByModule('mod-1')).toEqual({
            id: 's1'
        });
        expect(mockVrService.findSceneByModule).toHaveBeenCalledWith('mod-1');
    });
    it('findOneScene', async ()=>{
        mockVrService.findOneScene.mockResolvedValue({
            id: 's1'
        });
        expect(await controller.findOneScene('s1')).toEqual({
            id: 's1'
        });
        expect(mockVrService.findOneScene).toHaveBeenCalledWith('s1');
    });
    it('updateScene', async ()=>{
        const dto = {
            title: 'Updated'
        };
        mockVrService.updateScene.mockResolvedValue({
            id: 's1',
            title: 'Updated'
        });
        expect(await controller.updateScene('s1', dto)).toEqual({
            id: 's1',
            title: 'Updated'
        });
        expect(mockVrService.updateScene).toHaveBeenCalledWith('s1', dto);
    });
});

//# sourceMappingURL=vr.controller.spec.js.map