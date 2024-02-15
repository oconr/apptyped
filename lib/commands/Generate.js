var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Command, Option } from "clipanion";
import { Client, Databases, Query } from "node-appwrite";
import { promises as fs, existsSync } from "fs";
import ejs from "ejs";
import { exec } from "child_process";
import { join } from "path";
export class GenerateCommand extends Command {
    constructor() {
        super();
        this.databaseId = Option.String(`--databaseId,-d`, {
            required: false,
        });
        const endpoint = process.env.APPWRITE_ENDPOINT;
        if (endpoint === undefined || endpoint === null || endpoint === "") {
            throw new Error("APPWRITE_ENDPOINT is not defined");
        }
        const project = process.env.APPWRITE_PROJECT_ID;
        if (project === undefined || project === null || project === "") {
            throw new Error("APPWRITE_PROJECT is not defined");
        }
        const apiKey = process.env.APPWRITE_API_KEY;
        if (apiKey === undefined || apiKey === null || apiKey === "") {
            throw new Error("APPWRITE_API_KEY is not defined");
        }
        this.client = new Client();
        this.client.setEndpoint(endpoint).setProject(project).setKey(apiKey);
        this.db = new Databases(this.client);
    }
    toCamelCase(str, firstCapital = false) {
        return str
            .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 && !firstCapital
                ? word.toLowerCase()
                : word.toUpperCase();
        })
            .replace(/\s+/g, "")
            .replace(/-/g, "");
    }
    fetchDatabases() {
        return __awaiter(this, void 0, void 0, function* () {
            const list = yield this.db.list();
            return list.databases;
        });
    }
    fetchCollections(dbId, cursor) {
        return __awaiter(this, void 0, void 0, function* () {
            const queries = [Query.limit(100)];
            if (cursor !== undefined) {
                queries.push(Query.cursorAfter(cursor));
            }
            const list = yield this.db.listCollections(dbId, queries);
            if (list.collections.length === 100) {
                const nextBatch = yield this.fetchCollections(dbId, list.collections[list.collections.length - 1].$id);
                const all = list.collections.concat(nextBatch);
                return all;
            }
            return list.collections;
        });
    }
    selectDatabase(db) {
        return __awaiter(this, void 0, void 0, function* () {
            const collections = yield this.fetchCollections(db.$id);
            if (collections.length === 0) {
                this.context.stdout.write("No collections found\n");
                return;
            }
            if (existsSync(join(import.meta.dirname, "../../src", "schemas", "index.ts"))) {
                yield fs.unlink(join(import.meta.dirname, "../../src", "schemas", "index.ts"));
            }
            for (const collection of collections) {
                yield this.generateClass(collection);
            }
            yield fs.writeFile(join(import.meta.dirname, "../../src", "client.ts"), `export * from "./schemas";`);
            exec("npm run build");
            this.context.stdout.write("Done\n");
        });
    }
    generateAttributeType(attribute) {
        const typed = attribute;
        if (typed.type === "boolean") {
            return {
                key: `${this.toCamelCase(typed.key)}: "${typed.key}"`,
                type: `${this.toCamelCase(typed.key)}: boolean;`,
            };
        }
        if (typed.type === "integer" || typed.type === "double") {
            return {
                key: `${this.toCamelCase(typed.key)}: "${typed.key}"`,
                type: `${this.toCamelCase(typed.key)}: number;`,
            };
        }
        return {
            key: `${this.toCamelCase(typed.key)}: "${typed.key}"`,
            type: `${this.toCamelCase(typed.key)}: string;`,
        };
    }
    generateClass(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            const schemaName = `${collection.databaseId}-${collection.$id}`;
            const attributes = collection.attributes;
            const mappedAttributes = [];
            for (let i = 0; i < attributes.length; i++) {
                const attribute = attributes[i];
                const newAttribute = this.generateAttributeType(attribute);
                mappedAttributes.push(newAttribute);
            }
            const output = yield ejs.renderFile(join(import.meta.dirname, `./client.template.ejs`), {
                ClassName: this.toCamelCase(collection.name, true),
                DatabaseId: collection.databaseId,
                CollectionId: collection.$id,
                Attributes: mappedAttributes,
            });
            if (!existsSync(join(import.meta.dirname, "../../src", "schemas", "generated"))) {
                yield fs.mkdir(join(import.meta.dirname, "../../src", "schemas", "generated"));
            }
            yield fs.writeFile(join(import.meta.dirname, "../../src", "schemas", "generated", `${schemaName}.ts`), output);
            let currentBarrel = "";
            if (existsSync(join(import.meta.dirname, "../../src", "schemas", "index.ts"))) {
                currentBarrel = yield fs.readFile(join(import.meta.dirname, "../../src", "schemas", "index.ts"), "utf-8");
            }
            const newBarrel = currentBarrel + `export * from "./generated/${schemaName}.js";\n`;
            yield fs.writeFile(join(import.meta.dirname, "../../src", "schemas", "index.ts"), newBarrel);
        });
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            const dbs = yield this.fetchDatabases();
            if (dbs.length === 0) {
                this.context.stdout.write("No databases found\n");
                return;
            }
            if (dbs.length > 1 && this.databaseId === undefined) {
                this.context.stdout.write("Please provide a database id\n");
                return;
            }
            if (dbs.length > 1 && this.databaseId !== undefined) {
                const found = yield this.db.get(this.databaseId);
                yield this.selectDatabase(found);
            }
            if (dbs.length === 1) {
                yield this.selectDatabase(dbs[0]);
            }
        });
    }
}
GenerateCommand.paths = [[`generate`], [`g`]];
//# sourceMappingURL=Generate.js.map