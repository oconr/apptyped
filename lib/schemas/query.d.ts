import { QueryTypes } from "node-appwrite";
import { MapType } from "./base.js";
export type Attributes<T> = Extract<keyof T, string>[];
export type Attribute<T> = Extract<keyof T, string>;
export declare class Queries<T> {
    private mapping;
    constructor(mapping: MapType<T>);
    private mapAttributes;
    private mapAttribute;
    select(attributes: Attributes<T>): string;
    equal(attribute: Attribute<T>, value: QueryTypes): string;
    notEqual(attribute: Attribute<T>, value: QueryTypes): string;
    lessThan(attribute: Attribute<T>, value: QueryTypes): string;
    lessThanEqual(attribute: Attribute<T>, value: QueryTypes): string;
    greaterThan(attribute: Attribute<T>, value: QueryTypes): string;
    greaterThanEqual(attribute: Attribute<T>, value: QueryTypes): string;
    between(attribute: Attribute<T>, lowerBound: string | number, upperBound: string | number): string;
    isNull(attribute: Attribute<T>): string;
    isNotNull(attribute: Attribute<T>): string;
    startsWith(attribute: Attribute<T>, value: string): string;
    endsWith(attribute: Attribute<T>, value: string): string;
    search(attribute: Attribute<T>, value: string): string;
    orderDesc(attribute: Attribute<T>): string;
    orderAsc(attribute: Attribute<T>): string;
    limit(limit: number): string;
    offset(offset: number): string;
    cursorBefore(cursor: string): string;
    cursorAfter(cursor: string): string;
}
//# sourceMappingURL=query.d.ts.map