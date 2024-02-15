import { Query, QueryTypes } from "node-appwrite";
import { MapType } from "./base.js";

export type Attributes<T> = Extract<keyof T, string>[];

export type Attribute<T> = Extract<keyof T, string>;

export class Queries<T> {
  private mapping: MapType<T>;

  constructor(mapping: MapType<T>) {
    this.mapping = mapping;
  }

  private mapAttributes(attributes: Attributes<T>) {
    return attributes.map((attribute) => this.mapping[attribute] as string);
  }

  private mapAttribute(attribute: Attribute<T>) {
    return this.mapping[attribute] as string;
  }

  public select(attributes: Attributes<T>) {
    return Query.select(this.mapAttributes(attributes));
  }

  public equal(attribute: Attribute<T>, value: QueryTypes) {
    return Query.equal(this.mapAttribute(attribute), value);
  }

  public notEqual(attribute: Attribute<T>, value: QueryTypes) {
    return Query.notEqual(this.mapAttribute(attribute), value);
  }

  public lessThan(attribute: Attribute<T>, value: QueryTypes) {
    return Query.lessThan(this.mapAttribute(attribute), value);
  }

  public lessThanEqual(attribute: Attribute<T>, value: QueryTypes) {
    return Query.lessThanEqual(this.mapAttribute(attribute), value);
  }

  public greaterThan(attribute: Attribute<T>, value: QueryTypes) {
    return Query.greaterThan(this.mapAttribute(attribute), value);
  }

  public greaterThanEqual(attribute: Attribute<T>, value: QueryTypes) {
    return Query.greaterThanEqual(this.mapAttribute(attribute), value);
  }

  public between(
    attribute: Attribute<T>,
    lowerBound: string | number,
    upperBound: string | number
  ) {
    return Query.between(this.mapAttribute(attribute), lowerBound, upperBound);
  }

  public isNull(attribute: Attribute<T>) {
    return Query.isNull(this.mapAttribute(attribute));
  }

  public isNotNull(attribute: Attribute<T>) {
    return Query.isNotNull(this.mapAttribute(attribute));
  }

  public startsWith(attribute: Attribute<T>, value: string) {
    return Query.startsWith(this.mapAttribute(attribute), value);
  }

  public endsWith(attribute: Attribute<T>, value: string) {
    return Query.endsWith(this.mapAttribute(attribute), value);
  }

  public search(attribute: Attribute<T>, value: string) {
    return Query.search(this.mapAttribute(attribute), value);
  }

  public orderDesc(attribute: Attribute<T>) {
    return Query.orderDesc(this.mapAttribute(attribute));
  }

  public orderAsc(attribute: Attribute<T>) {
    return Query.orderAsc(this.mapAttribute(attribute));
  }

  public limit(limit: number) {
    return Query.limit(limit);
  }

  public offset(offset: number) {
    return Query.offset(offset);
  }

  public cursorBefore(cursor: string) {
    return Query.cursorBefore(cursor);
  }

  public cursorAfter(cursor: string) {
    return Query.cursorAfter(cursor);
  }
}
