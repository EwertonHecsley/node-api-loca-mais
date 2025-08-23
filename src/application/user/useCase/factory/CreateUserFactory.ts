import { User } from '@src/core/domain/user/entity/User';
import { Email } from '@src/core/domain/user/objectValue/Email';
import { BadRequestError } from '@src/shared/errors/custom/BadRequestError';
import { InvalidEmailError } from '@src/shared/errors/custom/InvalidEmailError';
import { left, right, type Either } from '@src/shared/utils/Either';

type CreateUserDto = {
  name: string;
  email: string;
  password: string;
};

export class CreateUserFactory {
  static create(
    dto: CreateUserDto,
  ): Either<BadRequestError | InvalidEmailError, User> {
    const { name, email, password } = dto;

    try {
      if (!name) return left(new BadRequestError('Name is required.'));
      if (!password) return left(new BadRequestError('Password is required.'));

      const emailValid = new Email(email);

      const user = User.create({
        name,
        password,
        email: emailValid,
      });

      return right(user);
    } catch (error) {
      if (error instanceof InvalidEmailError) {
        return left(error);
      }
      throw error;
    }
  }
}
