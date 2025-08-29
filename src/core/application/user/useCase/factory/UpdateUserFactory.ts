import { Email } from '@src/core/domain/user/objectValue/Email';
import { BadRequestError } from '@src/shared/errors/custom/BadRequestError';
import { InvalidEmailError } from '@src/shared/errors/custom/InvalidEmailError';
import { left, right, type Either } from '@src/shared/utils/Either';

export type UpdateUserDto = {
  id: string;
  name?: string;
  email?: string;
  password?: string;
};

type FactoryResponse = Either<
  BadRequestError | InvalidEmailError,
  UpdateUserDto
>;

export class UpdateUserFactory {
  static create(dto: UpdateUserDto): FactoryResponse {
    try {
      if (!dto.id) {
        return left(new BadRequestError('Id is required.'));
      }

      if (dto.email) {
        new Email(dto.email);
      }

      if (dto.name === '') {
        return left(new BadRequestError('Name cannot be empty.'));
      }

      return right(dto);
    } catch (error) {
      if (error instanceof InvalidEmailError) {
        return left(error);
      }
      throw error;
    }
  }
}
