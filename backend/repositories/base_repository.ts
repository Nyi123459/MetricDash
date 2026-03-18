import {
  BaseRepositoryInterface,
  PaginatedResult,
  QueryOptions,
} from "../types/base_repository";
import { DatabaseAdapter } from "../types/db_adapter";

export default class BaseRepository<T> implements BaseRepositoryInterface<T> {
  constructor(protected adapter: DatabaseAdapter<T>) {}

  async findById(
    id: number | string,
    include?: Record<string, boolean>,
  ): Promise<T | null> {
    return this.adapter.findById(id, { include });
  }

  async findOne(options: QueryOptions<T>): Promise<T | null> {
    return this.adapter.findOne(options);
  }

  async findAll(options?: QueryOptions<T> | undefined): Promise<T[]> {
    return this.adapter.findMany(options);
  }

  async findPaginated(options: QueryOptions<T>): Promise<PaginatedResult<T>> {
    const page = options.pagination?.page ?? 1;
    const perPage = options.pagination?.perPage ?? 10;

    const [data, total] = await Promise.all([
      this.adapter.findMany(options),
      this.adapter.count(options),
    ]);

    const lastPage = Math.max(1, Math.ceil(total / perPage));

    return {
      data,
      meta: {
        total,
        perPage,
        currentPage: page,
        firstPage: 1,
        hasMorePages: page < lastPage,
        lastPage,
      },
    };
  }

  async create(data: Partial<T>): Promise<T> {
    return this.adapter.create(data);
  }

  async update(id: number | string, data: Partial<T>): Promise<T | null> {
    return this.adapter.update(id, data);
  }

  async delete(id: number | string): Promise<boolean> {
    return this.adapter.delete(id);
  }

  async count(options?: QueryOptions<T> | undefined): Promise<number> {
    return this.adapter.count(options);
  }
}
