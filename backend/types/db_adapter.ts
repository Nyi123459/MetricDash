import type { QueryOptions } from "./base_repository";

export interface FindByIdOptions {
  include?: Record<string, boolean>;
  select?: Record<string, boolean>;
}

/**
 * Database Adapter for dynamic usage
 */
export interface DatabaseAdapter<T> {
  findById(id: number | string, options?: FindByIdOptions): Promise<T | null>;
  findOne(options: QueryOptions<T>): Promise<T | null>;
  findMany(options?: QueryOptions<T>): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: number | string, data: Partial<T>): Promise<T | null>;
  delete(id: number | string): Promise<boolean>;
  count(options?: QueryOptions<T>): Promise<number>;
}
