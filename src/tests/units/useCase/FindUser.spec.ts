import { User } from '@src/core/domain/user/entity/User';
import type { UserGateway } from '@src/core/domain/user/gateway/UserGateway';
import { NotFoundError } from '@src/shared/errors/custom/NotFoundError';
import { InternalServerError } from '@src/shared/errors/custom/InternalServerError';
import { FindByIdUserUseCase } from '@src/core/application/user/useCase/Find';

const mockUserGateway: jest.Mocked<UserGateway> = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  listAll: jest.fn(),
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

describe('FindByIdUserUseCase', () => {
  let findByIdUserUseCase: FindByIdUserUseCase;
  let mockUser: User;
  const validUserId = 'valid-user-id';
  const invalidUserId = 'invalid-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
    findByIdUserUseCase = new FindByIdUserUseCase(mockUserGateway);

    mockUser = new ActualUser(
      {
        name: 'Test User',
        email: new ActualEmail('test@example.com'),
        password: 'hashed-password',
      },
      new ActualIdentity(validUserId),
    );
  });

  it('should return a user if found by ID', async () => {
    mockUserGateway.findById.mockResolvedValue(mockUser);

    const result = await findByIdUserUseCase.execute({ id: validUserId });

    expect(mockUserGateway.findById).toHaveBeenCalledWith(validUserId);
    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(mockUser);
  });

  it('should return a NotFoundError if user is not found', async () => {
    mockUserGateway.findById.mockResolvedValue(null);

    const result = await findByIdUserUseCase.execute({ id: invalidUserId });

    expect(mockUserGateway.findById).toHaveBeenCalledWith(invalidUserId);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
    expect((result.value as NotFoundError).message).toBe('User not found');
  });

  it('should return an InternalServerError if an unexpected error occurs', async () => {
    const unexpectedError = new Error('Database connection lost');
    mockUserGateway.findById.mockRejectedValue(unexpectedError);

    const result = await findByIdUserUseCase.execute({ id: validUserId });

    expect(mockUserGateway.findById).toHaveBeenCalledWith(validUserId);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InternalServerError);
    expect((result.value as InternalServerError).message).toBe(
      'Internal server error.',
    );
  });

  it('should propagate NotFoundError if the gateway throws it', async () => {
    const notFoundError = new NotFoundError('User not found from gateway');
    mockUserGateway.findById.mockRejectedValue(notFoundError);

    const result = await findByIdUserUseCase.execute({ id: validUserId });

    expect(mockUserGateway.findById).toHaveBeenCalledWith(validUserId);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NotFoundError);
    expect((result.value as NotFoundError).message).toBe(
      'User not found from gateway',
    );
  });
});
