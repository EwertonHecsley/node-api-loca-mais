import type { UserGateway } from '@src/core/domain/user/gateway/UserGateway';
import { NotFoundError } from '@src/shared/errors/custom/NotFoundError';
import { left, right, type Either } from '@src/shared/utils/Either';

type RequestUser = {
  id: string;
};

type ResponseUser = Either<NotFoundError, true>;

export class DeleteUserUseCase {
  constructor(private readonly userGateway: UserGateway) {}

  async execute({ id }: RequestUser): Promise<ResponseUser> {
    const user = await this.userGateway.findById(id);
    if (!user) return left(new NotFoundError('User not found'));
    await this.userGateway.delete(id);
    return right(true);
  }
}
