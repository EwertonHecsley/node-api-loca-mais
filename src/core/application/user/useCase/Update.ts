import type { User } from '@src/core/domain/user/entity/User';
import type { EncryptionGateway } from '@src/core/domain/user/gateway/EncryptionGateway';
import type { UserGateway } from '@src/core/domain/user/gateway/UserGateway';
import { Email } from '@src/core/domain/user/objectValue/Email';
import { BadRequestError } from '@src/shared/errors/custom/BadRequestError';
import { InternalServerError } from '@src/shared/errors/custom/InternalServerError';
import { left, right, type Either } from '@src/shared/utils/Either';
import {
  UpdateUserFactory,
  type UpdateUserDto,
} from './factory/UpdateUserFactory';

type ResponseUser = Either<BadRequestError | InternalServerError, User>;

export class UpdateUserUseCase {
  constructor(
    private readonly userGateway: UserGateway,
    private readonly encryptionGateway: EncryptionGateway,
  ) {}

  async execute(data: UpdateUserDto): Promise<ResponseUser> {
    const validatedDtoOrError = UpdateUserFactory.create(data);
    if (validatedDtoOrError.isLeft()) {
      return left(validatedDtoOrError.value);
    }

    const { id } = validatedDtoOrError.value;

    const user = await this.userGateway.findById(id);

    if (!user) {
      return left(new BadRequestError('User not found'));
    }

    if (data.email && data.email !== user.email.valueOf) {
      const emailExist = await this.userGateway.findByEmail(data.email);
      if (emailExist) {
        return left(new BadRequestError('Email already in use'));
      }
      const newEmail = new Email(data.email);
      user.updateEmail(newEmail);
    }

    if (data.name) {
      user.updateName(data.name);
    }

    if (data.password) {
      const newHashPassword = await this.encryptionGateway.hash(data.password);
      user.updatePasswordHash(newHashPassword);
    }

    try {
      await this.userGateway.save(user);
      return right(user);
    } catch (error) {
      return left(new InternalServerError('Failed to update user'));
    }
  }
}
