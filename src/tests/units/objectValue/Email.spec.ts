import { Email } from '@src/core/domain/user/objectValue/Email';
import { InvalidEmailError } from '@src/shared/errors/custom/InvalidEmailError';

describe('Email Object Value', () => {
  it('should be able to create an Email object with a valid email address', () => {
    const validEmail = 'test@example.com';
    const email = new Email(validEmail);

    expect(email).toBeInstanceOf(Email);
    expect(email.valueOf).toBe(validEmail);
  });

  it('should throw InvalidEmailError if an invalid email address is provided', () => {
    const invalidEmail = 'invalid-email';

    expect(() => new Email(invalidEmail)).toThrow(InvalidEmailError);
  });

  it('should throw InvalidEmailError if a null or empty email is provided', () => {
    expect(() => new Email(null as any)).toThrow(InvalidEmailError);
    expect(() => new Email('')).toThrow(InvalidEmailError);
    expect(() => new Email('   ')).toThrow(InvalidEmailError);
  });

  it('should return true when comparing two Email objects with the same value', () => {
    const email1 = new Email('test@example.com');
    const email2 = new Email('test@example.com');

    expect(email1.equals(email2)).toBe(true);
  });

  it('should return false when comparing two Email objects with different values', () => {
    const email1 = new Email('test1@example.com');
    const email2 = new Email('test2@example.com');

    expect(email1.equals(email2)).toBe(false);
  });

  it('should return false when comparing an Email object with a non-Email object', () => {
    const email = new Email('test@example.com');
    const nonEmailObject = { value: 'test@example.com' };

    expect(email.equals(nonEmailObject as any)).toBe(false);
  });
});
