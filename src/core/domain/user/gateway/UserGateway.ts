import type { User } from '../entity/User';

export abstract class UserGateway {
  abstract create(entity: User): Promise<User>;
  abstract findByEmail(email: string): Promise<User | null>;
}
