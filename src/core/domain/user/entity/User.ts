import { Entity } from '@src/core/generics/Entity';
import type { Identity } from '@src/core/generics/Identity';
import { BadRequestError } from '@src/shared/errors/custom/BadRequestError';
import type { Optional } from '@src/shared/utils/optional';
import type { Email } from '../objectValue/Email';

type UserProps = {
  name: string;
  email: Email;
  password: string;
  createdAt: Date;
};

export class User extends Entity<UserProps> {
  private constructor(props: Optional<UserProps, 'createdAt'>, id?: Identity) {
    super({ ...props, createdAt: props.createdAt ?? new Date() }, id);
  }

  static create(props: Optional<UserProps, 'createdAt'>, id?: Identity): User {
    this.validateName(props.name);
    return new User(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get email(): Email {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  updateName(name: string): void {
    User.validateName(name);
    this.props.name = name;
  }

  updatePasswordHash(passwordHash: string): void {
    this.props.password = passwordHash;
  }

  updateEmail(email: Email): void {
    User.validateEmail(email);
    if (email.equals(this.props.email)) {
      return;
    }
    this.props.email = email;
  }

  private static validateName(name: string) {
    if (!name || name.trim() == '') {
      throw new BadRequestError('Name is required.');
    }
  }

  private static validateEmail(email: Email) {
    if (!email) {
      throw new BadRequestError('Email is required.');
    }
  }

  private static validatePassword(password: string) {
    if (!password || password.trim() == '') {
      throw new BadRequestError('Password is required.');
    }
  }
}
