import {
  CreateUserFactory,
  type CreateUserDto,
} from '@src/core/application/user/useCase/factory/CreateUserFactory';
import { User } from '@src/core/domain/user/entity/User';
import { Email } from '@src/core/domain/user/objectValue/Email';
import { BadRequestError } from '@src/shared/errors/custom/BadRequestError';
import { InvalidEmailError } from '@src/shared/errors/custom/InvalidEmailError';

const { Email: ActualEmail } = jest.requireActual(
  '@src/core/domain/user/objectValue/Email',
);
jest.mock('@src/core/domain/user/objectValue/Email', () => ({
  Email: jest.fn().mockImplementation((email: string) => {
    return new ActualEmail(email);
  }),
}));

const { User: ActualUser } = jest.requireActual(
  '@src/core/domain/user/entity/User',
);
jest.mock('@src/core/domain/user/entity/User', () => ({
  User: {
    create: jest.fn().mockImplementation((props) => {
      return ActualUser.create(props);
    }),
  },
}));

describe('CreateUserFactory', () => {
  const validDto: CreateUserDto = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'securepassword',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (Email as unknown as jest.Mock).mockImplementation(
      (email: string) => new ActualEmail(email),
    );
    (User.create as jest.Mock).mockImplementation((props) =>
      ActualUser.create(props),
    );
  });

  it('should return a User entity when DTO is valid', () => {
    const result = CreateUserFactory.create(validDto);

    expect(result.isRight()).toBe(true);
    expect((result.value as User).name).toBe(validDto.name);
    expect((result.value as User).email.valueOf).toBe(validDto.email);
    expect((result.value as User).password).toBe(validDto.password);
    expect(Email).toHaveBeenCalledTimes(1);
    expect(User.create).toHaveBeenCalledTimes(1);
  });

  it('should return a BadRequestError if name is missing from DTO', () => {
    const dtoWithoutName = { ...validDto, name: '' };
    const result = CreateUserFactory.create(dtoWithoutName);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestError);
    expect((result.value as BadRequestError).message).toBe('Name is required.');
    expect(Email).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
  });

  it('should return a BadRequestError if password is missing from DTO', () => {
    const dtoWithoutPassword = { ...validDto, password: '' };
    const result = CreateUserFactory.create(dtoWithoutPassword);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestError);
    expect((result.value as BadRequestError).message).toBe(
      'Password is required.',
    );
    expect(Email).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
  });

  it('should return an InvalidEmailError if email is invalid', () => {
    const dtoWithInvalidEmail = { ...validDto, email: 'invalid-email' };

    (Email as unknown as jest.Mock).mockImplementation(() => {
      throw new InvalidEmailError();
    });

    const result = CreateUserFactory.create(dtoWithInvalidEmail);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidEmailError);
    expect(Email).toHaveBeenCalledTimes(1);
    expect(User.create).not.toHaveBeenCalled();
  });

  it('should re-throw unexpected errors', () => {
    const unexpectedError = new Error('Database connection failed');

    (User.create as jest.Mock).mockImplementation(() => {
      throw unexpectedError;
    });

    expect(() => CreateUserFactory.create(validDto)).toThrow(unexpectedError);
    expect(Email).toHaveBeenCalledTimes(1); // Email deve ter sido criado
    expect(User.create).toHaveBeenCalledTimes(1);
  });
});
