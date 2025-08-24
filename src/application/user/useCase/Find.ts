import type { User } from "@src/core/domain/user/entity/User";
import type { UserGateway } from "@src/core/domain/user/gateway/UserGateway";
import { InternalServerError } from "@src/shared/errors/custom/InternalServerError";
import { NotFoundError } from "@src/shared/errors/custom/NotFoundError";
import { left, right, type Either } from "@src/shared/utils/Either";

type RequestUser = {
    id:string;
}

type ResponseUser = Either<NotFoundError | InternalServerError,User>;

export class FindByIdUserUseCase {
  constructor(private readonly userGateway:UserGateway){}

  async execute({id}:RequestUser):Promise<ResponseUser>{
    try {
      const user = await this.userGateway.findById(id);
      if(!user) return left(new NotFoundError('User not found'));
      return right(user);
    } catch (error) {
      if(!(error instanceof NotFoundError)){
        return left(new InternalServerError());
      }
      return left(error);
    }
  }
}
