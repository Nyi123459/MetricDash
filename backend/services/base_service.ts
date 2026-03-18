import {
  BaseRepositoryInterface,
  QueryOptions,
  PaginatedResult,
} from "../types/base_repository";

export default class BaseService<T> {
  constructor(protected repository: BaseRepositoryInterface<T>) {}

  async findById(
    id: number | string,
    include?: Record<string, boolean>,
  ): Promise<T | null> {
    return this.repository.findById(id, include);
  }

  async findOne(options: QueryOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async findAll(options?: QueryOptions<T>): Promise<T[]> {
    return this.repository.findAll(options);
  }

  async findPaginated(options: QueryOptions<T>): Promise<PaginatedResult<T>> {
    return this.repository.findPaginated(options);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.repository.create(data);
  }

  async update(id: number | string, data: Partial<T>): Promise<T | null> {
    return this.repository.update(id, data);
  }

  async delete(id: number | string): Promise<boolean> {
    return this.repository.delete(id);
  }

  async count(options?: QueryOptions<T>): Promise<number> {
    return this.repository.count(options);
  }

  async exists(id: number | string): Promise<boolean> {
    const entity = await this.repository.findById(id);
    return entity !== null;
  }
}
