import { Models, Client, Databases } from "appwrite";
import { Queries } from "./query.js";
import { BaseDocument, MapType, MappingType } from "./base.js";

class BaseCollection<ReadType extends BaseDocument, WriteType extends object> {
  protected client = new Client();
  protected db: Databases;

  protected mapping: MapType<ReadType>;

  public q: Queries<ReadType>;

  constructor(mapping: MappingType<ReadType>) {
    if (!process.env.APPWRITE_ENDPOINT) {
      throw new Error("APPWRITE_ENDPOINT is not defined");
    }

    if (!process.env.APPWRITE_PROJECT) {
      throw new Error("APPWRITE_PROJECT is not defined");
    }

    this.client
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT);

    this.db = new Databases(this.client);
    this.mapping = this.createMap(mapping);

    this.q = new Queries<ReadType>(this.mapping);
  }

  protected createMap(mapping: MappingType<ReadType>): MapType<ReadType> {
    const result: MapType<ReadType> = {
      $id: "$id",
      $collectionId: "$collectionId",
      $databaseId: "$databaseId",
      $createdAt: "$createdAt",
      $updatedAt: "$updatedAt",
      $permissions: "$permissions",
    } as MapType<ReadType>;

    Object.keys(mapping).forEach((key) => {
      result[key as keyof ReadType] = mapping[key];
    });

    return result;
  }

  protected parse(document: Models.Document): ReadType {
    const readKeys = Object.keys(this.mapping) as (keyof ReadType)[];
    let result: ReadType = {} as ReadType;

    Object.keys(document).forEach((key) => {
      const value = document[key];
      const readKey = readKeys.find((k) => this.mapping[k] === key);
      if (readKey === undefined) return;
      result[readKey] = value;
    });

    return result;
  }

  protected parseList(
    documentList: Models.DocumentList<Models.Document>
  ): Models.DocumentList<ReadType> {
    return {
      total: documentList.total,
      documents: documentList.documents.map((doc) => this.parse(doc)),
    };
  }

  public async listDocuments(
    databaseId: string,
    collectionId: string,
    queries?: string[]
  ) {
    const result = await this.db.listDocuments(
      databaseId,
      collectionId,
      queries
    );

    return this.parseList(result);
  }

  public async createDocument(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: WriteType
  ) {
    const result = await this.db.createDocument(
      databaseId,
      collectionId,
      documentId,
      data
    );

    return this.parse(result);
  }

  public async getDocument(
    databaseId: string,
    collectionId: string,
    documentId: string
  ) {
    const result = await this.db.getDocument(
      databaseId,
      collectionId,
      documentId
    );

    return this.parse(result);
  }

  public async updateDocument(
    databaseId: string,
    collectionId: string,
    documentId: string,
    data: WriteType
  ) {
    const result = await this.db.updateDocument(
      databaseId,
      collectionId,
      documentId,
      data
    );

    return this.parse(result);
  }

  public async deleteDocument(
    databaseId: string,
    collectionId: string,
    documentId: string
  ) {
    return this.db.deleteDocument(databaseId, collectionId, documentId);
  }
}

export default BaseCollection;
