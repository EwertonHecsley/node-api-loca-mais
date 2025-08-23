// src/tests/units/application/user/useCase/CreateUserUseCase.spec.ts
import {
  CreateUserUseCase,
  type UserRequest,
} from '@src/application/user/useCase/Create';
import { CreateUserFactory } from '@src/application/user/useCase/factory/CreateUserFactory';
import { User } from '@src/core/domain/user/entity/User';
import { BadRequestError } from '@src/shared/errors/custom/BadRequestError';
import { InvalidEmailError } from '@src/shared/errors/custom/InvalidEmailError';
import { left, right } from '@src/shared/utils/Either';
import type { EncryptionGateway } from '@src/core/domain/user/gateway/EncryptionGateway';
import type { UserGateway } from '@src/core/domain/user/gateway/UserGateway';

const mockEncryptionGateway: jest.Mocked<EncryptionGateway> = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const mockUserGateway: jest.Mocked<UserGateway> = {
  create: jest.fn(),
};

jest.mock('@src/application/user/useCase/factory/CreateUserFactory', () => ({
  CreateUserFactory: {
    create: jest.fn(),
  },
}));

const { Identity: ActualIdentity } = jest.requireActual(
  '@src/core/generics/Identity',
);
const { Email: ActualEmail } = jest.requireActual(
  '@src/core/domain/user/objectValue/Email',
);
const { User: ActualUser } = jest.requireActual(
  '@src/core/domain/user/entity/User',
);

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let validUserRequest: UserRequest;
  let mockUser: User;
  let mockCreatedUser: User;
  const hashedPassword = 'hashed_password_123';

  beforeEach(() => {
    jest.clearAllMocks();

    createUserUseCase = new CreateUserUseCase(
      mockUserGateway,
      mockEncryptionGateway,
    );

    validUserRequest = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    mockUser = new ActualUser(
      {
        name: validUserRequest.name,
        email: new ActualEmail(validUserRequest.email),
        password: validUserRequest.password,
        createdAt: new Date(),
      },
      new ActualIdentity('mock-user-id'),
    );
    jest.spyOn(mockUser, 'updatePasswordHash');

    mockCreatedUser = new ActualUser(
      {
        name: validUserRequest.name,
        email: new ActualEmail(validUserRequest.email),
        password: hashedPassword,
        createdAt: new Date(),
      },
      new ActualIdentity('mock-user-id'),
    );

    (CreateUserFactory.create as jest.Mock).mockReturnValue(right(mockUser));
    mockEncryptionGateway.hash.mockResolvedValue(hashedPassword);
    mockUserGateway.create.mockResolvedValue(mockCreatedUser);
  });

  it('should create a user successfully with valid data', async () => {
    const result = await createUserUseCase.execute(validUserRequest);

    expect(CreateUserFactory.create).toHaveBeenCalledWith(validUserRequest);
    expect(mockEncryptionGateway.hash).toHaveBeenCalledWith(
      validUserRequest.password,
    );
    expect(mockUser.updatePasswordHash).toHaveBeenCalledWith(hashedPassword);
    expect(mockUserGateway.create).toHaveBeenCalledWith(mockUser);
    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(mockCreatedUser);
  });

  it('should return an error if CreateUserFactory fails with BadRequestError', async () => {
    const factoryError = new BadRequestError('Name is required.');
    (CreateUserFactory.create as jest.Mock).mockReturnValue(left(factoryError));

    const result = await createUserUseCase.execute(validUserRequest);

    expect(CreateUserFactory.create).toHaveBeenCalledWith(validUserRequest);
    expect(mockEncryptionGateway.hash).not.toHaveBeenCalled();
    expect(mockUserGateway.create).not.toHaveBeenCalled();
    expect(result.isLeft()).toBe(true);
    expect(result.value).toEqual(factoryError);
  });

  it('should return an error if CreateUserFactory fails with InvalidEmailError', async () => {
    const factoryError = new InvalidEmailError();
    (CreateUserFactory.create as jest.Mock).mockReturnValue(left(factoryError));

    const result = await createUserUseCase.execute(validUserRequest);

    expect(CreateUserFactory.create).toHaveBeenCalledWith(validUserRequest);
    expect(mockEncryptionGateway.hash).not.toHaveBeenCalled();
    expect(mockUserGateway.create).not.toHaveBeenCalled();
    expect(result.isLeft()).toBe(true);
    expect(result.value).toEqual(factoryError);
  });

  it('should throw an error if encryptionGateway.hash fails', async () => {
    const encryptionError = new Error('Encryption failed');
    mockEncryptionGateway.hash.mockRejectedValue(encryptionError);

    await expect(createUserUseCase.execute(validUserRequest)).rejects.toThrow(
      encryptionError,
    );

    expect(CreateUserFactory.create).toHaveBeenCalledWith(validUserRequest);
    expect(mockEncryptionGateway.hash).toHaveBeenCalledWith(
      validUserRequest.password,
    );
    expect(mockUserGateway.create).not.toHaveBeenCalled();
  });

  it('should throw an error if userGateway.create fails', async () => {
    const gatewayError = new Error('Database error');
    mockUserGateway.create.mockRejectedValue(gatewayError);

    await expect(createUserUseCase.execute(validUserRequest)).rejects.toThrow(
      gatewayError,
    );

    expect(CreateUserFactory.create).toHaveBeenCalledWith(validUserRequest);
    expect(mockEncryptionGateway.hash).toHaveBeenCalledWith(
      validUserRequest.password,
    );
    expect(mockUser.updatePasswordHash).toHaveBeenCalledWith(hashedPassword);
    expect(mockUserGateway.create).toHaveBeenCalledWith(mockUser);
  });
});
