import { Query } from "node-appwrite";
export class Queries {
    constructor(mapping) {
        this.mapping = mapping;
    }
    mapAttributes(attributes) {
        return attributes.map((attribute) => this.mapping[attribute]);
    }
    mapAttribute(attribute) {
        return this.mapping[attribute];
    }
    select(attributes) {
        return Query.select(this.mapAttributes(attributes));
    }
    equal(attribute, value) {
        return Query.equal(this.mapAttribute(attribute), value);
    }
    notEqual(attribute, value) {
        return Query.notEqual(this.mapAttribute(attribute), value);
    }
    lessThan(attribute, value) {
        return Query.lessThan(this.mapAttribute(attribute), value);
    }
    lessThanEqual(attribute, value) {
        return Query.lessThanEqual(this.mapAttribute(attribute), value);
    }
    greaterThan(attribute, value) {
        return Query.greaterThan(this.mapAttribute(attribute), value);
    }
    greaterThanEqual(attribute, value) {
        return Query.greaterThanEqual(this.mapAttribute(attribute), value);
    }
    between(attribute, lowerBound, upperBound) {
        return Query.between(this.mapAttribute(attribute), lowerBound, upperBound);
    }
    isNull(attribute) {
        return Query.isNull(this.mapAttribute(attribute));
    }
    isNotNull(attribute) {
        return Query.isNotNull(this.mapAttribute(attribute));
    }
    startsWith(attribute, value) {
        return Query.startsWith(this.mapAttribute(attribute), value);
    }
    endsWith(attribute, value) {
        return Query.endsWith(this.mapAttribute(attribute), value);
    }
    search(attribute, value) {
        return Query.search(this.mapAttribute(attribute), value);
    }
    orderDesc(attribute) {
        return Query.orderDesc(this.mapAttribute(attribute));
    }
    orderAsc(attribute) {
        return Query.orderAsc(this.mapAttribute(attribute));
    }
    limit(limit) {
        return Query.limit(limit);
    }
    offset(offset) {
        return Query.offset(offset);
    }
    cursorBefore(cursor) {
        return Query.cursorBefore(cursor);
    }
    cursorAfter(cursor) {
        return Query.cursorAfter(cursor);
    }
}
//# sourceMappingURL=query.js.map