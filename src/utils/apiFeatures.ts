/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * used to apply sorting , filter , fields and pagination , specially made for prisma functions
 *
 * @export
 * @class APIFeatures
 * @template T  typeof prisma.job.findMany
 */
export class APIFeatures<T> {
  queryString: Record<string, string>;
  filterOptions: T;
  limit: number;
  offset: number;
  constructor(queryString: Record<string, string>) {
    this.filterOptions = {} as T;
    this.queryString = queryString;
    this.limit = 10;
    this.offset = 0;
  }
  filter() {
    const {
      fields,
      sortby,
      sortOrder,
      limit,
      offset,
      searchBy,
      search,
      ...otherFields
    } = this.queryString;
    let selectedFilters: Record<string, unknown> = {};
    //  this will loop through fields
    for (const [rawKey, rawValue] of Object.entries(otherFields)) {
      // this will split key and value eg price[gte] => ["price" , "gte"]
      const match = rawKey.match(/^(\w+)(\[(\w+)\])?$/);
      if (!match) continue;
      const field = match[1];
      const operator = match[3];
      let value: unknown = rawValue;
      // this wil convert string to types eg "true" => true or "134" => 123
      if (rawValue === "true") value = true;
      else if (rawValue === "false") value = false;
      else if (!isNaN(Number(rawValue))) value = Number(rawValue);
      //  build filter condition
      if (operator) {
        selectedFilters[field] = { [operator]: value };
      } else {
        selectedFilters[field] = value;
      }
    }
    // add search filter (one at time )
    if (searchBy && search) {
      selectedFilters = {
        ...selectedFilters,
        ...{
          [searchBy]: {
            contains: search,
            mode: "insensitive",
          },
        },
      };
    }
    this.filterOptions = { ...this.filterOptions, where: selectedFilters };
    return this;
  }
  limitFields() {
    const { fields } = this.queryString;
    const selectedField: { [key: string]: boolean } = {};
    if (fields) {
      String(fields)
        .split(",")
        .forEach((item: string) => {
          return (selectedField[item] = true);
        });
      this.filterOptions = { ...this.filterOptions, select: selectedField };
    }
    return this;
  }
  sort() {
    const { sortby, sortOrder } = this.queryString;
    let sorting: { [key: string]: string };

    if (sortby) {
      sorting = {
        [String(sortby)]: String(sortOrder || "desc"),
      };
      this.filterOptions = { ...this.filterOptions, orderBy: sorting };
    }
    return this;
  }
  pagination() {
    const { offset, limit } = this.queryString;
    this.filterOptions = {
      ...this.filterOptions,
      skip: this.offset,
      take: this.limit,
    };

    if (offset) this.offset = Number(offset);
    if (limit) this.limit = Number(limit);
    return this;
  }
  activeOnly() {
    this.filterOptions = {
      ...this.filterOptions,
      where: {
        ...(this.filterOptions as { where: object }).where,
        active: true,
      },
    };
    return this;
  }
}
