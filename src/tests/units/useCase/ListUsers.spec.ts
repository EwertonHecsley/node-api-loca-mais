import { ListAllUsersUseCase } from '@src/application/user/useCase/List';
import { User } from '@src/core/domain/user/entity/User';
import type {
  PaginatedResponse,
  UserGateway,
} from '@src/core/domain/user/gateway/UserGateway';
import { InternalServerError } from '@src/shared/errors/custom/InternalServerError';

const mockUserGateway: jest.Mocked<UserGateway> = {
  create: jest.fn(),
  findByEmail: jest.fn(),
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

describe('ListAllUsersUseCase', () => {
  let listAllUsersUseCase: ListAllUsersUseCase;
  let mockUsers: User[];
  const page = 1;
  const limit = 10;
  const total = 20;

  beforeEach(() => {
    jest.clearAllMocks();
    listAllUsersUseCase = new ListAllUsersUseCase(mockUserGateway);

    mockUsers = [
      new ActualUser(
        {
          name: 'User One',
          email: new ActualEmail('one@example.com'),
          password: 'hash1',
        },
        new ActualIdentity('id-1'),
      ),
      new ActualUser(
        {
          name: 'User Two',
          email: new ActualEmail('two@example.com'),
          password: 'hash2',
        },
        new ActualIdentity('id-2'),
      ),
    ];
  });

  it('should return a list of users with pagination info on success', async () => {
    const mockResponse: PaginatedResponse<User> = {
      data: mockUsers,
      total,
      page,
      limit,
    };
    mockUserGateway.listAll.mockResolvedValue(mockResponse);

    const result = await listAllUsersUseCase.execute(page, limit);

    expect(mockUserGateway.listAll).toHaveBeenCalledWith({ page, limit });
    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(mockResponse);
  });

  it('should return an InternalServerError on failure', async () => {
    const gatewayError = new Error('Database connection failed.');
    mockUserGateway.listAll.mockRejectedValue(gatewayError);

    const result = await listAllUsersUseCase.execute(page, limit);

    expect(mockUserGateway.listAll).toHaveBeenCalledWith({ page, limit });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InternalServerError);
    expect((result.value as InternalServerError).message).toBe(
      'Error listing users',
    );
  });
});
