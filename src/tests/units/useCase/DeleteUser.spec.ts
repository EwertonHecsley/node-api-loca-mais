import { DeleteUserUseCase } from '@src/core/application/user/useCase/Delete';
import type { User } from '@src/core/domain/user/entity/User';
import type { UserGateway } from '@src/core/domain/user/gateway/UserGateway';
import { InternalServerError } from '@src/shared/errors/custom/InternalServerError';
import { NotFoundError } from '@src/shared/errors/custom/NotFoundError';

const mockUserGateway: jest.Mocked<UserGateway> = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  listAll: jest.fn(),
  delete: jest.fn(),
};

const { Identity: ActualIdentity } = jest.requireActual(
  '@src/core/generics/Identity',
);
const { Email: ActualEmail } = jest.requireActual(
  '@src/core/domain/user/objectValue/Email',
);
const { User: ActualUser } = jest.requireActual(
  '@src/core/domain/user/entity/User',
);

describe('DeleteUserUseCase', () => {
  let deleteUserUseCase: DeleteUserUseCase;
  let mockUser: User;
  const userId = 'valid-user-id';
  const notFoundUserId = 'non-existent-id';

  beforeEach(() => {
    jest.clearAllMocks();
    deleteUserUseCase = new DeleteUserUseCase(mockUserGateway);

    mockUser = new ActualUser(
      {
        name: 'Test User',
        email: new ActualEmail('test@example.com'),
        password: 'hashed-password',
      },
      new ActualIdentity(userId),
    );
  });

  it('should return true on successful deletion', async () => {
    mockUserGateway.findById.mockResolvedValue(mockUser);
    mockUserGateway.delete.mockResolvedValue(undefined);

    const result = await deleteUserUseCase.execute({ id: userId });

    expect(mockUserGateway.findById).toHaveBeenCalledWith(userId);
    expect(mockUserGateway.delete).toHaveBeenCalledWith(userId);
    expect(result.isRight()).toBe(true);
    expect(result.value).toBe(true);
  });

  it('should return a NotFoundError if the user does not exist', async () => {
    mockUserGateway.findById.mockResolvedValue(null);

    const result = await deleteUserUseCase.execute({ id: notFoundUserId });

    expect(mockUserGateway.findById).toHaveBeenCalledWith(notFoundUserId);
    expect(mockUserGateway.delete).not.toHaveBeenCalled();
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
    expect((result.value as NotFoundError).message).toBe('User not found');
  });

  it('should return an InternalServerError if the gateway fails during findById', async () => {
    const gatewayError = new InternalServerError('Database connection failed');
    mockUserGateway.findById.mockRejectedValue(gatewayError);

    const result = await deleteUserUseCase.execute({ id: userId });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InternalServerError);
  });

  it('should return an InternalServerError if the gateway fails during delete', async () => {
    const gatewayError = new InternalServerError('Database write failed');
    mockUserGateway.findById.mockResolvedValue(mockUser);
    mockUserGateway.delete.mockRejectedValue(gatewayError);

    const result = await deleteUserUseCase.execute({ id: userId });

    expect(mockUserGateway.findById).toHaveBeenCalledWith(userId);
    expect(mockUserGateway.delete).toHaveBeenCalledWith(userId);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InternalServerError);
  });
});
