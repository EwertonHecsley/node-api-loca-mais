import type { User } from '../entity/User';

export type FindAllParams = {
  page: number;
  limit: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

export abstract class UserGateway {
  abstract create(entity: User): Promise<User>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract listAll(params: FindAllParams): Promise<PaginatedResponse<User>>;
  abstract findById(id: string): Promise<User | null>;
  abstract delete(id: string): Promise<void>;
  abstract save(entity: User): Promise<void>;
}
