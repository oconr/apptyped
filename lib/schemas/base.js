var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Client, Databases } from "node-appwrite";
import { Queries } from "./query.js";
class BaseCollection {
    constructor(mapping) {
        this.client = new Client();
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
        this.q = new Queries(this.mapping);
    }
    createMap(mapping) {
        const result = {
            $id: "$id",
            $collectionId: "$collectionId",
            $databaseId: "$databaseId",
            $createdAt: "$createdAt",
            $updatedAt: "$updatedAt",
            $permissions: "$permissions",
        };
        Object.keys(mapping).forEach((key) => {
            result[key] = mapping[key];
        });
        return result;
    }
    parse(document) {
        const readKeys = Object.keys(this.mapping);
        let result = {};
        Object.keys(document).forEach((key) => {
            const value = document[key];
            const readKey = readKeys.find((k) => this.mapping[k] === key);
            if (readKey === undefined)
                return;
            result[readKey] = value;
        });
        return result;
    }
    parseList(documentList) {
        return {
            total: documentList.total,
            documents: documentList.documents.map((doc) => this.parse(doc)),
        };
    }
    listDocuments(databaseId, collectionId, queries) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.db.listDocuments(databaseId, collectionId, queries);
            return this.parseList(result);
        });
    }
    createDocument(databaseId, collectionId, documentId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.db.createDocument(databaseId, collectionId, documentId, data);
            return this.parse(result);
        });
    }
    getDocument(databaseId, collectionId, documentId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.db.getDocument(databaseId, collectionId, documentId);
            return this.parse(result);
        });
    }
    updateDocument(databaseId, collectionId, documentId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.db.updateDocument(databaseId, collectionId, documentId, data);
            return this.parse(result);
        });
    }
    deleteDocument(databaseId, collectionId, documentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.deleteDocument(databaseId, collectionId, documentId);
        });
    }
}
export default BaseCollection;
//# sourceMappingURL=base.js.map