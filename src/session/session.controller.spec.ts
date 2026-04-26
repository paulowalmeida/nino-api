import { Test, TestingModule } from '@nestjs/testing';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';

describe('SessionController', () => {
  let controller: SessionController;
  let service: SessionService;

  const mockSession = { id: 'session-id', userId: 'user-id', refreshToken: 'token', expiresAt: new Date() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SessionController],
      providers: [
        {
          provide: SessionService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockSession),
            getListByUserId: jest.fn().mockResolvedValue([mockSession]),
            getById: jest.fn().mockResolvedValue(mockSession),
            update: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<SessionController>(SessionController);
    service = module.get<SessionService>(SessionService);
  });

  it('should create a session', async () => {
    const dto = { userId: 'user-id', refreshToken: 'token', expiresAt: new Date() };
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockSession);
  });

  it('should get a list of sessions by user id', async () => {
    const result = await controller.getListByUserId('user-id');
    expect(service.getListByUserId).toHaveBeenCalledWith('user-id');
    expect(result).toEqual([mockSession]);
  });

  it('should get a session by id', async () => {
    const result = await controller.getById('session-id');
    expect(service.getById).toHaveBeenCalledWith('session-id');
    expect(result).toEqual(mockSession);
  });

  it('should update a session and return the updated entity', async () => {
    const dto = { refreshToken: 'new-token' };
    const result = await controller.update('session-id', dto);
    expect(service.update).toHaveBeenCalledWith('session-id', dto);
    expect(service.getById).toHaveBeenCalledWith('session-id');
    expect(result).toEqual(mockSession);
  });

  it('should delete a session and return a success message', async () => {
    const result = await controller.delete('session-id');
    expect(service.delete).toHaveBeenCalledWith('session-id');
    expect(result).toEqual({ message: 'session deleted successfully' });
  });
});