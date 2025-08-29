import { User } from '@src/core/domain/user/entity/User';
import { BadRequestError } from '@src/shared/errors/custom/BadRequestError';
import { InternalServerError } from '@src/shared/errors/custom/InternalServerError';
import { left, right } from '@src/shared/utils/Either';
import type { EncryptionGateway } from '@src/core/domain/user/gateway/EncryptionGateway';
import type { UserGateway } from '@src/core/domain/user/gateway/UserGateway';
import { UpdateUserUseCase } from '@src/core/application/user/useCase/Update';
import {
  UpdateUserFactory,
  type UpdateUserDto,
} from '@src/core/application/user/useCase/factory/UpdateUserFactory';

const mockUserGateway: jest.Mocked<UserGateway> = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
  listAll: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
};

const mockEncryptionGateway: jest.Mocked<EncryptionGateway> = {
  hash: jest.fn(),
  compare: jest.fn(),
};

jest.mock(
  '@src/core/application/user/useCase/factory/UpdateUserFactory',
  () => ({
    UpdateUserFactory: {
      create: jest.fn(),
    },
  }),
);

const { Identity: ActualIdentity } = jest.requireActual(
  '@src/core/generics/Identity',
);
const { Email: ActualEmail } = jest.requireActual(
  '@src/core/domain/user/objectValue/Email',
);
const { User: ActualUser } = jest.requireActual(
  '@src/core/domain/user/entity/User',
);

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
  let existingUser: User;
  let validUpdateDto: UpdateUserDto;
  const userId = 'user-id-123';
  const hashedPassword = 'new_hashed_password';

  beforeEach(() => {
    jest.clearAllMocks();

    updateUserUseCase = new UpdateUserUseCase(
      mockUserGateway,
      mockEncryptionGateway,
    );

    existingUser = new ActualUser(
      {
        name: 'Original Name',
        email: new ActualEmail('original@example.com'),
        password: 'old_hashed_password',
        createdAt: new Date(),
      },
      new ActualIdentity(userId),
    );

    validUpdateDto = {
      id: userId,
      name: 'Updated Name',
      email: 'updated@example.com',
      password: 'new_password',
    };

    (UpdateUserFactory.create as jest.Mock).mockReturnValue(
      right(validUpdateDto),
    );
    mockUserGateway.findById.mockResolvedValue(existingUser);
    mockUserGateway.findByEmail.mockResolvedValue(null);
    mockEncryptionGateway.hash.mockResolvedValue(hashedPassword);
    mockUserGateway.save.mockResolvedValue(undefined);

    jest.spyOn(existingUser, 'updateName');
    jest.spyOn(existingUser, 'updateEmail');
    jest.spyOn(existingUser, 'updatePasswordHash');
  });

  it('should update all user details successfully', async () => {
    const result = await updateUserUseCase.execute(validUpdateDto);

    expect(UpdateUserFactory.create).toHaveBeenCalledWith(validUpdateDto);
    expect(mockUserGateway.findById).toHaveBeenCalledWith(userId);
    expect(existingUser.updateName).toHaveBeenCalledWith(validUpdateDto.name);
    expect(mockUserGateway.findByEmail).toHaveBeenCalledWith(
      validUpdateDto.email,
    );
    expect(existingUser.updateEmail).toHaveBeenCalledWith(
      new ActualEmail(validUpdateDto.email!),
    );
    expect(mockEncryptionGateway.hash).toHaveBeenCalledWith(
      validUpdateDto.password,
    );
    expect(existingUser.updatePasswordHash).toHaveBeenCalledWith(
      hashedPassword,
    );
    expect(mockUserGateway.save).toHaveBeenCalledWith(existingUser);

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(existingUser);
    expect(existingUser.name).toBe(validUpdateDto.name);
    expect(existingUser.email.valueOf).toBe(validUpdateDto.email);
    expect(existingUser.password).toBe(hashedPassword);
  });

  it('should update only the user name', async () => {
    const dtoOnlyName = { id: userId, name: 'New Name' };
    (UpdateUserFactory.create as jest.Mock).mockReturnValue(right(dtoOnlyName));

    const result = await updateUserUseCase.execute(dtoOnlyName);

    expect(existingUser.updateName).toHaveBeenCalledWith(dtoOnlyName.name);
    expect(existingUser.updateEmail).not.toHaveBeenCalled();
    expect(existingUser.updatePasswordHash).not.toHaveBeenCalled();
    expect(mockUserGateway.findByEmail).not.toHaveBeenCalled();
    expect(mockEncryptionGateway.hash).not.toHaveBeenCalled();
    expect(mockUserGateway.save).toHaveBeenCalledWith(existingUser);
    expect(result.isRight()).toBe(true);
    expect(existingUser.name).toBe(dtoOnlyName.name);
  });

  it("should update only the user email if it's different and not in use", async () => {
    const dtoOnlyEmail = { id: userId, email: 'newemail@example.com' };
    (UpdateUserFactory.create as jest.Mock).mockReturnValue(
      right(dtoOnlyEmail),
    );

    const result = await updateUserUseCase.execute(dtoOnlyEmail);

    expect(existingUser.updateName).not.toHaveBeenCalled();
    expect(mockUserGateway.findByEmail).toHaveBeenCalledWith(
      dtoOnlyEmail.email,
    );
    expect(existingUser.updateEmail).toHaveBeenCalledWith(
      new ActualEmail(dtoOnlyEmail.email!),
    );
    expect(existingUser.updatePasswordHash).not.toHaveBeenCalled();
    expect(mockEncryptionGateway.hash).not.toHaveBeenCalled();
    expect(mockUserGateway.save).toHaveBeenCalledWith(existingUser);
    expect(result.isRight()).toBe(true);
    expect(existingUser.email.valueOf).toBe(dtoOnlyEmail.email);
  });

  it('should update only the user password', async () => {
    const dtoOnlyPassword = { id: userId, password: 'new_secure_password' };
    (UpdateUserFactory.create as jest.Mock).mockReturnValue(
      right(dtoOnlyPassword),
    );

    const result = await updateUserUseCase.execute(dtoOnlyPassword);

    expect(existingUser.updateName).not.toHaveBeenCalled();
    expect(existingUser.updateEmail).not.toHaveBeenCalled();
    expect(mockEncryptionGateway.hash).toHaveBeenCalledWith(
      dtoOnlyPassword.password,
    );
    expect(existingUser.updatePasswordHash).toHaveBeenCalledWith(
      hashedPassword,
    );
    expect(mockUserGateway.save).toHaveBeenCalledWith(existingUser);
    expect(result.isRight()).toBe(true);
    expect(existingUser.password).toBe(hashedPassword);
  });

  it('should not update email if the new email is the same as the current one', async () => {
    const dtoSameEmail = { id: userId, email: 'original@example.com' };
    (UpdateUserFactory.create as jest.Mock).mockReturnValue(
      right(dtoSameEmail),
    );

    const result = await updateUserUseCase.execute(dtoSameEmail);

    expect(mockUserGateway.findByEmail).not.toHaveBeenCalled();
    expect(existingUser.updateEmail).not.toHaveBeenCalled();
    expect(mockUserGateway.save).toHaveBeenCalledWith(existingUser);
    expect(result.isRight()).toBe(true);
    expect(existingUser.email.valueOf).toBe('original@example.com');
  });

  it('should return an error if UpdateUserFactory fails', async () => {
    const factoryError = new BadRequestError('Id is required.');
    (UpdateUserFactory.create as jest.Mock).mockReturnValue(left(factoryError));

    const result = await updateUserUseCase.execute(validUpdateDto);

    expect(UpdateUserFactory.create).toHaveBeenCalledWith(validUpdateDto);
    expect(mockUserGateway.findById).not.toHaveBeenCalled();
    expect(result.isLeft()).toBe(true);
    expect(result.value).toEqual(factoryError);
  });

  it('should return BadRequestError if user not found', async () => {
    mockUserGateway.findById.mockResolvedValue(null);

    const result = await updateUserUseCase.execute(validUpdateDto);

    expect(mockUserGateway.findById).toHaveBeenCalledWith(userId);
    expect(UpdateUserFactory.create).toHaveBeenCalledWith(validUpdateDto);
    expect(mockUserGateway.findByEmail).not.toHaveBeenCalled();
    expect(mockEncryptionGateway.hash).not.toHaveBeenCalled();
    expect(mockUserGateway.save).not.toHaveBeenCalled();
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestError);
    expect((result.value as BadRequestError).message).toBe('User not found');
  });

  it('should return BadRequestError if new email is already in use by another user', async () => {
    mockUserGateway.findByEmail.mockResolvedValueOnce(
      new ActualUser(
        {
          name: 'Other User',
          email: new ActualEmail(validUpdateDto.email!),
          password: 'hash',
        },
        new ActualIdentity('other-user-id'),
      ),
    );

    const result = await updateUserUseCase.execute(validUpdateDto);

    expect(mockUserGateway.findById).toHaveBeenCalledWith(userId);
    expect(mockUserGateway.findByEmail).toHaveBeenCalledWith(
      validUpdateDto.email,
    );
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestError);
    expect((result.value as BadRequestError).message).toBe(
      'Email already in use',
    );
    expect(existingUser.updateEmail).not.toHaveBeenCalled();
    expect(mockEncryptionGateway.hash).not.toHaveBeenCalled();
    expect(mockUserGateway.save).not.toHaveBeenCalled();
  });

  it('should return InternalServerError if userGateway.save fails', async () => {
    mockUserGateway.save.mockRejectedValue(new Error('Database write error'));

    const result = await updateUserUseCase.execute(validUpdateDto);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InternalServerError);
    expect((result.value as InternalServerError).message).toBe(
      'Failed to update user',
    );
  });

  it('should return InternalServerError if userGateway.findById throws an unexpected error', async () => {
    mockUserGateway.findById.mockRejectedValue(new Error('Network error'));

    const result = await updateUserUseCase.execute(validUpdateDto);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InternalServerError);
    expect((result.value as InternalServerError).message).toBe(
      'Failed to update user',
    );
  });

  it('should return InternalServerError if encryptionGateway.hash throws an error', async () => {
    mockEncryptionGateway.hash.mockRejectedValue(
      new Error('Encryption service unavailable'),
    );

    const result = await updateUserUseCase.execute(validUpdateDto);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InternalServerError);
    expect((result.value as InternalServerError).message).toBe(
      'Failed to update user',
    );
    expect(mockUserGateway.save).not.toHaveBeenCalled();
  });
});
