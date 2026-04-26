import { Test, TestingModule } from '@nestjs/testing';
import { CredentialController } from './credential.controller';
import { CredentialsService } from './credential.service';

describe('CredentialController', () => {
  let controller: CredentialController;
  let service: CredentialsService;

  const mockCredential = { id: 'cred-id', userId: 'user-id', email: 'test@test.com' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CredentialController],
      providers: [
        {
          provide: CredentialsService,
          useValue: {
            getAll: jest.fn().mockResolvedValue([mockCredential]),
            getById: jest.fn().mockResolvedValue(mockCredential),
            update: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    controller = module.get<CredentialController>(CredentialController);
    service = module.get<CredentialsService>(CredentialsService);
  });

  it('should get a list of credentials by user id', async () => {
    const result = await controller.getAll('user-id');
    expect(service.getAll).toHaveBeenCalledWith('user-id');
    expect(result).toEqual([mockCredential]);
  });

  it('should get a credential by id', async () => {
    const result = await controller.getById('cred-id');
    expect(service.getById).toHaveBeenCalledWith('cred-id');
    expect(result).toEqual(mockCredential);
  });

  // it('should update a credential and return the updated entity', async () => {
  //   const updateDto = { email: 'new@test.com' };
  //   const result = await controller.update('cred-id', updateDto);
  //   expect(service.update).toHaveBeenCalledWith('cred-id', updateDto);
  //   expect(service.getById).toHaveBeenCalledWith('cred-id');
  //   expect(result).toEqual(mockCredential);
  // });

  it('should delete a credential and return a success message', async () => {
    const result = await controller.delete('cred-id');
    expect(service.delete).toHaveBeenCalledWith('cred-id');
    expect(result).toEqual({ message: 'credential deleted successfully' });
  });
});