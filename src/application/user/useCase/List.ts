import type { User } from '@src/core/domain/user/entity/User';
import type {
  PaginatedResponse,
  UserGateway,
} from '@src/core/domain/user/gateway/UserGateway';
import { InternalServerError } from '@src/shared/errors/custom/InternalServerError';
import { left, right, type Either } from '@src/shared/utils/Either';

type ResponseUser = Either<InternalServerError, PaginatedResponse<User>>;

export class ListAllUsersUseCase {
  constructor(private readonly userGateway: UserGateway) {}

  async execute(page: number, limit: number): Promise<ResponseUser> {
    try {
      const users = await this.userGateway.listAll({ page, limit });
      return right(users);
    } catch (error) {
      return left(new InternalServerError('Error listing users'));
    }
  }
}
