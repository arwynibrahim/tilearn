import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUsersService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users with default params', async () => {
      const expected = { users: [], total: 0, page: 1, limit: 20, totalPages: 0 };
      mockUsersService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(1, 20, []);

      expect(mockUsersService.findAll).toHaveBeenCalledWith(1, 20, []);
      expect(result).toEqual(expected);
    });

    it('should pass org-scoped memberships to service', async () => {
      mockUsersService.findAll.mockResolvedValue({ users: [], total: 0, page: 2, limit: 10, totalPages: 0 });
      const memberships = [{ contextType: 'ORGANIZATION', contextId: 'org-1', role: 'ADMIN' }];
      await controller.findAll('2' as any, '10' as any, memberships);
      expect(mockUsersService.findAll).toHaveBeenCalledWith(2, 10, memberships);
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      const user = { id: 'user-1', email: 'test@test.com' };
      mockUsersService.findOne.mockResolvedValue(user);

      const result = await controller.findOne('user-1');

      expect(mockUsersService.findOne).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto = { nom: 'Updated' };
      const updated = { id: 'user-1', nom: 'Updated' };
      mockUsersService.update.mockResolvedValue(updated);

      const result = await controller.update('user-1', dto, 'admin-1');

      expect(mockUsersService.update).toHaveBeenCalledWith('user-1', dto, 'admin-1');
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.remove.mockResolvedValue({ message: 'Utilisateur supprimé' });

      const result = await controller.remove('user-1', 'admin-1');

      expect(mockUsersService.remove).toHaveBeenCalledWith('user-1', 'admin-1');
      expect(result).toEqual({ message: 'Utilisateur supprimé' });
    });
  });
});
