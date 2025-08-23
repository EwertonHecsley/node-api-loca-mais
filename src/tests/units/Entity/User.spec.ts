import { User } from '@src/core/domain/user/entity/User';
import { Email } from '@src/core/domain/user/objectValue/Email';
import { Identity } from '@src/core/generics/Identity';
import { BadRequestError } from '@src/shared/errors/custom/BadRequestError';

const { Identity: ActualIdentity } = jest.requireActual(
  '@src/core/generics/Identity',
);

jest.mock('@src/core/generics/Identity', () => ({
  Identity: jest
    .fn()
    .mockImplementation((id?: string) => new ActualIdentity(id)),
}));

describe('User Entity', () => {
  const hashedPassword = 'hashed_password_123';

  const validProps = {
    name: 'John Doe',
    email: new Email('john.doe@example.com'),
    password: hashedPassword,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be able to create a User with valid properties', () => {
    const user = User.create(validProps);

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe(validProps.name);
    expect(user.email).toBe(validProps.email);
    expect(user.password).toBe(validProps.password);
    expect(user.createdAt).toEqual(validProps.createdAt);
    expect(Identity).toHaveBeenCalledTimes(1);
  });

  it('should be able to create a User with a provided Identity', () => {
    const providedId = new ActualIdentity('test-user-id');
    const user = User.create(validProps, providedId);

    expect(user).toBeInstanceOf(User);
    expect(user.identityId.id).toBe('test-user-id');
  });

  it('should throw BadRequestError if name is not provided on creation', () => {
    const invalidProps = { ...validProps, name: '' };
    expect(() => User.create(invalidProps)).toThrow(BadRequestError);
  });

  it('should not throw BadRequestError if password is an empty string on creation (passado pelo useCase)', () => {
    const invalidProps = { ...validProps, password: '' };
    expect(() => User.create(invalidProps)).not.toThrow(BadRequestError);
  });

  it('should not throw BadRequestError if email is a valid object on creation', () => {
    expect(() => User.create(validProps)).not.toThrow();
  });

  it('should return the correct property values from getters', () => {
    const user = User.create(validProps);
    expect(user.name).toBe(validProps.name);
    expect(user.email.valueOf).toBe(validProps.email.valueOf);
    expect(user.password).toBe(validProps.password);
    expect(user.createdAt).toBe(validProps.createdAt);
  });

  it('should be able to update the user name', () => {
    const user = User.create(validProps);
    const newName = 'Jane Doe';
    user.updateName(newName);

    expect(user.name).toBe(newName);
  });

  it('should throw BadRequestError if the updated name is invalid', () => {
    const user = User.create(validProps);
    expect(() => user.updateName('')).toThrow(BadRequestError);
  });

  it('should be able to update the user password with a new hash', () => {
    const user = User.create(validProps);
    const newHashedPassword = 'new_hashed_password_123';
    user.updatePasswordHash(newHashedPassword);

    expect(user.password).toBe(newHashedPassword);
  });

  it('should be able to update the user email', () => {
    const user = User.create(validProps);
    const newEmail = new Email('jane.doe@example.com');
    user.updateEmail(newEmail);

    expect(user.email).toBe(newEmail);
  });

  it('should not update email if the new email is the same as the current one', () => {
    const user = User.create(validProps);
    const currentEmail = user.email;

    user.updateEmail(currentEmail);
    expect(user.email).toBe(currentEmail);
  });

  it('should throw BadRequestError if the updated email is null or undefined', () => {
    const user = User.create(validProps);
    expect(() => user.updateEmail(null as any)).toThrow(BadRequestError);
  });
});
