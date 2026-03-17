/**
 * Filter operator types for dynamic queries
 */
export type FilterOperator =
  | "="
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "contains" // Prisma equivalent of 'like'
  | "startsWith"
  | "endsWith"
  | "in"
  | "notIn"
  | "between"
  | "isNull"
  | "isNotNull";

/**
 * Single Filter
 */
export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value?: any;
  values?: any[]; // For 'in', 'notIn', 'between'
}

/**
 * Logical group of filters with AND/OR logic
 */
export interface FilterGroup {
  conditions: FilterCondition[];
  logic?: "and" | "or";
}

/**
 * Complete filter structure supporting nested groups
 */
export interface Filter {
  groups?: FilterGroup[];
  logic?: "and" | "or";
}

/**
 * Search configuration
 */
export interface SearchConfig {
  term: string;
  fields: string[];
  exact?: boolean;
}

/**
 * Sorting configuration
 */
export interface SortingConfig {
  field: string;
  sort: "asc" | "desc";
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  page: number;
  perPage: number;
}

/**
 * Query options combining all dynamic query features
 */
export interface QueryOptions<T> {
  filter?: Filter;
  search?: SearchConfig;
  sort?: SortingConfig | SortingConfig[];
  pagination?: PaginationConfig;
  select?: Array<keyof T>;
  include?: Record<string, boolean>;
}

/**
 * Paginated result structure
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
    firstPage: number;
    hasMorePages: boolean;
  };
}

/**
 * Base repository interface for Prisma models
 */
export interface BaseRepositoryInterface<T> {
  findById(
    id: number | string,
    include?: Record<string, boolean>,
  ): Promise<T | null>;
  findOne(options: QueryOptions<T>): Promise<T | null>;
  findAll(options?: QueryOptions<T>): Promise<T[]>;
  findPaginated(options: QueryOptions<T>): Promise<PaginatedResult<T>>;
  create(data: Partial<T>): Promise<T>;
  update(id: number | string, data: Partial<T>): Promise<T | null>;
  delete(id: number | string): Promise<boolean>;
  count(options?: QueryOptions<T>): Promise<number>;
}