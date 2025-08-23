import { InvalidEmailError } from '@src/shared/errors/custom/InvalidEmailError';

export class Email {
  private readonly value: string;

  constructor(email: string) {
    if (!Email.validateEmail(email)) {
      throw new InvalidEmailError();
    }
    this.value = email;
  }

  private static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  get valueOf(): string {
    return this.value;
  }

  public equals(other: Email): boolean {
    if (!(other instanceof Email)) {
      return false;
    }
    return this.value === other.value;
  }
}
