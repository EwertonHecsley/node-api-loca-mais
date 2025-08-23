import type { User } from '@src/core/domain/user/entity/User';
import type { EncryptionGateway } from '@src/core/domain/user/gateway/EncryptionGateway';
import type { UserGateway } from '@src/core/domain/user/gateway/UserGateway';
import type { BadRequestError } from '@src/shared/errors/custom/BadRequestError';
import { left, right, type Either } from '@src/shared/utils/Either';
import { CreateUserFactory } from './factory/CreateUserFactory';

type UserRequest = {
  name: string;
  email: string;
  password: string;
};

type UserResponse = Either<BadRequestError, User>;

export class CreateUserUseCase {
  constructor(
    private readonly userGateway: UserGateway,
    private readonly encryptionGateway: EncryptionGateway,
  ) {}

  async execute(data: UserRequest): Promise<UserResponse> {
    const userSucessOrError = CreateUserFactory.create(data);
    if (userSucessOrError.isLeft()) {
      return left(userSucessOrError.value);
    }

    const user = userSucessOrError.value;
    const encryptedPassword = await this.encryptionGateway.hash(user.password);
    user.updatePasswordHash(encryptedPassword);
    const createdUser = await this.userGateway.create(user);

    return right(createdUser);
  }
}
