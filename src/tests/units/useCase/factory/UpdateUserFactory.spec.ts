import {
  UpdateUserFactory,
  type UpdateUserDto,
} from '@src/core/application/user/useCase/factory/UpdateUserFactory';
import { Email } from '@src/core/domain/user/objectValue/Email';
import { BadRequestError } from '@src/shared/errors/custom/BadRequestError';
import { InvalidEmailError } from '@src/shared/errors/custom/InvalidEmailError';

const { Email: ActualEmail } = jest.requireActual(
  '@src/core/domain/user/objectValue/Email',
);
jest.mock('@src/core/domain/user/objectValue/Email', () => ({
  Email: jest.fn().mockImplementation((email: string) => {
    if (!ActualEmail.validateEmail(email)) {
      throw new InvalidEmailError();
    }
    return new ActualEmail(email);
  }),
}));

describe('UpdateUserFactory', () => {
  const baseDto: UpdateUserDto = {
    id: 'user-id-123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'newSecurePassword',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (Email as unknown as jest.Mock).mockImplementation((email: string) => {
      if (!ActualEmail.validateEmail(email)) {
        throw new InvalidEmailError();
      }
      return new ActualEmail(email);
    });
  });

  it('should return Right with the DTO if all data is valid', () => {
    const result = UpdateUserFactory.create(baseDto);

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(baseDto);
    expect(Email).toHaveBeenCalledWith(baseDto.email);
  });

  it('should return Right with the DTO if only some fields are provided', () => {
    const partialDto: UpdateUserDto = {
      id: 'user-id-123',
      name: 'Jane Doe',
    };
    const result = UpdateUserFactory.create(partialDto);

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual(partialDto);
    expect(Email).not.toHaveBeenCalled();
  });

  it('should return BadRequestError if id is missing', () => {
    const dtoWithoutId = { ...baseDto, id: '' };
    const result = UpdateUserFactory.create(dtoWithoutId);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestError);
    expect((result.value as BadRequestError).message).toBe('Id is required.');
    expect(Email).not.toHaveBeenCalled();
  });

  it('should return BadRequestError if name is an empty string', () => {
    const dtoWithEmptyName = { ...baseDto, name: '' };
    const result = UpdateUserFactory.create(dtoWithEmptyName);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(BadRequestError);
    expect((result.value as BadRequestError).message).toBe(
      'Name cannot be empty.',
    );
    expect(Email).toHaveBeenCalledWith(baseDto.email);
  });

  it('should return InvalidEmailError if email is malformed', () => {
    const dtoWithInvalidEmail = { ...baseDto, email: 'invalid-email' };

    const result = UpdateUserFactory.create(dtoWithInvalidEmail);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidEmailError);
    expect(Email).toHaveBeenCalledWith(dtoWithInvalidEmail.email);
  });

  it('should re-throw unexpected errors', () => {
    const unexpectedError = new Error('Something unexpected happened');

    (Email as unknown as jest.Mock).mockImplementation(() => {
      throw unexpectedError;
    });

    expect(() => UpdateUserFactory.create(baseDto)).toThrow(unexpectedError);
  });
});
