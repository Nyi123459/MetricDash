import { Prisma } from "../generated/prisma/client";
import {
  DatabaseAdapter,
  FindByIdOptions,
} from "../types/db_adapter";
import {
  QueryOptions,
  Filter,
  FilterGroup,
  FilterCondition,
  SearchConfig,
  SortingConfig,
} from "../types/base_repository";

export class PrismaAdapter<T> implements DatabaseAdapter<T> {
    constructor(
        private model: any,
        private primaryKey: string = "id",
    ) {}

    async findById(id: number | string, options?: FindByIdOptions): Promise<T | null> {
        return this.model.findUnique({
            where: this.buildIdWhere(id),
            ...options,
        });
    }

    async findOne(options: QueryOptions<T>): Promise<T | null> {
        const prismaOptions = this.buildPrismaOptions(options);
        return this.model.findFirst(prismaOptions);
    }

    async findMany(options?: QueryOptions<T>): Promise<T[]> {
        const prismaOptions = this.buildPrismaOptions(options);
        return this.model.findMany(prismaOptions);
    }

    async create(data: Partial<T>): Promise<T> {
        return this.model.create({ data });
    }

    async update(id: number | string, data: Partial<T>): Promise<T | null> {
        try {
            return await this.model.update({
                where: this.buildIdWhere(id),
                data,
            });
        } catch (error) {
            if (this.isRecordNotFoundError(error)) {
                return null;
            }

            throw error;
        }
    }

    async delete(id: number | string): Promise<boolean> {
        try {
            await this.model.delete({
                where: this.buildIdWhere(id),
            });

            return true;
        } catch (error) {
            if (this.isRecordNotFoundError(error)) {
                return false;
            }

            throw error;
        }
    }

    async count(options?: QueryOptions<T>): Promise<number> {
        const prismaOptions = this.buildPrismaOptions(options);
        return this.model.count({ where: prismaOptions.where });
    }

    private buildPrismaOptions(options?: QueryOptions<T>): any {
        if (!options) return {};

        const prismaOptions: any = {};

        if (options.select && options.include) {
            throw new Error("QueryOptions cannot contain both 'select' and 'include' for Prisma queries.");
        }

        if (options.filter || options.search) {
            prismaOptions.where = this.buildWhere(options.filter, options.search);
        }

        if (options.sort) {
            prismaOptions.orderBy = this.buildOrderBy(options.sort);
        }

        if (options.pagination) {
            prismaOptions.take = options.pagination.perPage;
            prismaOptions.skip = (options.pagination.page - 1) * options.pagination.perPage;
        }

        if (options.select) {
            prismaOptions.select = options.select.reduce((acc: Record<string, boolean>, key) => {
                acc[key as string] = true;
                return acc;
            }, {});
        }

        if (options.include) {
            prismaOptions.include = options.include;
        }

        return prismaOptions;
    }

    private buildWhere(filter?: Filter, search?: SearchConfig): any {
        const conditions: any[] = [];

        if (filter) {
            conditions.push(this.buildFilterWhere(filter));
        }

        if (search) {
            const searchConditions = search.fields.map(field => {
                if (search.exact) {
                    return { [field]: search.term };
                } else {
                    return { [field]: { contains: search.term } };
                }
            });
            conditions.push({ OR: searchConditions });
        }

        if (conditions.length === 1) {
            return conditions[0];
        } else if (conditions.length > 1) {
            return { AND: conditions };
        }

        return {};
    }

    private buildFilterWhere(filter: Filter): any {
        if (!filter.groups) return {};

        const conditions = filter.groups.map(group => this.buildGroup(group));

        if (filter.logic === 'or') {
            return { OR: conditions };
        } else {
            return { AND: conditions };
        }
    }

    private buildGroup(group: FilterGroup): any {
        const conditions = group.conditions.map(cond => this.buildCondition(cond));

        if (group.logic === 'or') {
            return { OR: conditions };
        } else {
            return { AND: conditions };
        }
    }

    private buildCondition(cond: FilterCondition): any {
        const field = cond.field;
        const value = cond.value;
        const values = cond.values;

        switch (cond.operator) {
            case '=': return { [field]: value };
            case '!=': return { [field]: { not: value } };
            case '>': return { [field]: { gt: value } };
            case '>=': return { [field]: { gte: value } };
            case '<': return { [field]: { lt: value } };
            case '<=': return { [field]: { lte: value } };
            case 'contains': return { [field]: { contains: value } };
            case 'startsWith': return { [field]: { startsWith: value } };
            case 'endsWith': return { [field]: { endsWith: value } };
            case 'in': return { [field]: { in: values } };
            case 'notIn': return { [field]: { notIn: values } };
            case 'between': return { [field]: { gte: values?.[0], lte: values?.[1] } };
            case 'isNull': return { [field]: null };
            case 'isNotNull': return { [field]: { not: null } };
            default: return {};
        }
    }

    private buildOrderBy(sort?: SortingConfig | SortingConfig[]): any {
        if (!sort) return {};

        if (Array.isArray(sort)) {
            return sort.map(s => ({ [s.field]: s.sort }));
        } else {
            return { [sort.field]: sort.sort };
        }
    }

    private buildIdWhere(id: number | string): Record<string, number | string> {
        return { [this.primaryKey]: id };
    }

    private isRecordNotFoundError(error: unknown): boolean {
        return (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025"
        );
    }
}
