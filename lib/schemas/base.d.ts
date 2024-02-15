import { Client, Databases } from "node-appwrite";
import { Queries } from "./query.js";
import { Models } from "appwrite";
export type MappingType<ReadType> = Record<keyof Omit<ReadType, "$id" | "$collectionId" | "$databaseId" | "$createdAt" | "$updatedAt" | "$permissions">, string>;
export type MapType<ReadType> = Record<keyof ReadType, string>;
declare class BaseCollection<ReadType extends Models.Document, WriteType extends object> {
    protected client: Client;
    protected db: Databases;
    protected mapping: MapType<ReadType>;
    q: Queries<ReadType>;
    constructor(mapping: MappingType<ReadType>);
    protected createMap(mapping: MappingType<ReadType>): MapType<ReadType>;
    protected parse(document: Models.Document): ReadType;
    protected parseList(documentList: Models.DocumentList<Models.Document>): Models.DocumentList<ReadType>;
    listDocuments(databaseId: string, collectionId: string, queries?: string[]): Promise<Models.DocumentList<ReadType>>;
    createDocument(databaseId: string, collectionId: string, documentId: string, data: WriteType): Promise<ReadType>;
    getDocument(databaseId: string, collectionId: string, documentId: string): Promise<ReadType>;
    updateDocument(databaseId: string, collectionId: string, documentId: string, data: WriteType): Promise<ReadType>;
    deleteDocument(databaseId: string, collectionId: string, documentId: string): Promise<string>;
}
export default BaseCollection;
//# sourceMappingURL=base.d.ts.map