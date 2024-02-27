import { Command, Option } from "clipanion";
import { Client, Databases, Models, Query } from "node-appwrite";
import { promises as fs, existsSync } from "fs";
import ejs from "ejs";
import { exec } from "child_process";
import { join } from "path";

type BaseAttributeType = {
  key: string;
  status: "available" | "processing" | "deleting" | "stuck" | "failed";
  error: string;
  required: boolean;
  array: boolean;
  mappedValue: string;
};

type BooleanAttributeType = BaseAttributeType & {
  type: "boolean";
  default: boolean;
};

type IntegerAttributeType = BaseAttributeType & {
  type: "integer";
  min: number;
  max: number;
  default: number;
};

type FloatAttributeType = BaseAttributeType & {
  type: "double";
  min: number;
  max: number;
  default: number;
};

type StringAttributeType = BaseAttributeType & {
  type: "string";
  default: string;
  size: number;
};

type EmailAttributeType = Omit<StringAttributeType, "size"> & {
  format: "email";
};

type EnumAttributeType = Omit<StringAttributeType, "size"> & {
  elements: string[];
  format: "enum";
};

type UrlAttributeType = Omit<StringAttributeType, "size"> & {
  format: "url";
};

type IPAttributeType = Omit<StringAttributeType, "size"> & {
  format: "ip";
};

type DateTimeAttributeType = BaseAttributeType & {
  type: "datetime";
  format: string;
  default: string;
};

type RelationshipAttributeType = Omit<
  StringAttributeType,
  "size" | "default"
> & {
  relatedCollection: string;
  relationType: "oneToOne" | "oneToMany" | "manyToOne" | "manyToMany";
  twoWay: boolean;
  twoWayKey: string;
  onDelete: "restrict" | "cascade" | "setNull";
  side: "parent" | "child";
};

type AttributeType =
  | BooleanAttributeType
  | IntegerAttributeType
  | FloatAttributeType
  | StringAttributeType
  | EmailAttributeType
  | EnumAttributeType
  | UrlAttributeType
  | IPAttributeType
  | DateTimeAttributeType
  | RelationshipAttributeType;

export class GenerateCommand extends Command {
  static paths = [[`generate`], [`g`]];

  private client: Client;
  private db: Databases;

  databaseId = Option.String(`--databaseId,-d`, {
    required: false,
  });

  constructor() {
    super();

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

  private toCamelCase(str: string, firstCapital = false) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 && !firstCapital
          ? word.toLowerCase()
          : word.toUpperCase();
      })
      .replace(/\s+/g, "")
      .replace(/-/g, "");
  }

  private async fetchDatabases() {
    const list = await this.db.list();
    return list.databases;
  }

  private async fetchCollections(
    dbId: string,
    cursor?: string
  ): Promise<Models.Collection[]> {
    const queries: string[] = [Query.limit(100)];

    if (cursor !== undefined) {
      queries.push(Query.cursorAfter(cursor));
    }

    const list = await this.db.listCollections(dbId, queries);

    if (list.collections.length === 100) {
      const nextBatch = await this.fetchCollections(
        dbId,
        list.collections[list.collections.length - 1].$id
      );
      const all = list.collections.concat(nextBatch);
      return all;
    }

    return list.collections;
  }

  private async selectDatabase(db: Models.Database) {
    const collections = await this.fetchCollections(db.$id);
    if (collections.length === 0) {
      this.context.stdout.write("No collections found\n");
      return;
    }

    if (
      existsSync(join(import.meta.dirname, "../../src", "schemas", "index.ts"))
    ) {
      await fs.unlink(
        join(import.meta.dirname, "../../src", "schemas", "index.ts")
      );
    }

    if (
      existsSync(join(import.meta.dirname, "../../src", "schemas", "generated"))
    ) {
      const previousFiles = await fs.readdir(
        join(import.meta.dirname, "../../src", "schemas", "generated")
      );

      for (const file of previousFiles) {
        await fs.unlink(
          join(import.meta.dirname, "../../src", "schemas", "generated", file)
        );
      }
    }

    for (const collection of collections) {
      await this.generateClass(collection);
    }

    await fs.writeFile(
      join(import.meta.dirname, "../../src", "client.ts"),
      `export * from "./schemas";`
    );

    exec("npx tsc");

    this.context.stdout.write(
      "The SDK has been generated and now is ready to use."
    );
  }

  private generateAttributeType(attribute: string): {
    key: string;
    type: string;
  } {
    const typed = attribute as unknown as AttributeType;

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

  private async generateClass(collection: Models.Collection) {
    const schemaName = `${collection.databaseId}-${collection.$id}`;

    const attributes = collection.attributes;
    const mappedAttributes: {
      key: string;
      type: string;
    }[] = [];
    for (let i = 0; i < attributes.length; i++) {
      const attribute = attributes[i];
      const newAttribute = this.generateAttributeType(attribute);
      mappedAttributes.push(newAttribute);
    }

    const output = await ejs.renderFile(
      join(import.meta.dirname, `./client.template.ejs`),
      {
        ClassName: this.toCamelCase(collection.name, true),
        DatabaseId: collection.databaseId,
        CollectionId: collection.$id,
        Attributes: mappedAttributes,
      }
    );

    if (
      !existsSync(
        join(import.meta.dirname, "../../src", "schemas", "generated")
      )
    ) {
      await fs.mkdir(
        join(import.meta.dirname, "../../src", "schemas", "generated")
      );
    }

    await fs.writeFile(
      join(
        import.meta.dirname,
        "../../src",
        "schemas",
        "generated",
        `${schemaName}.ts`
      ),
      output
    );
    let currentBarrel = "";

    if (
      existsSync(join(import.meta.dirname, "../../src", "schemas", "index.ts"))
    ) {
      currentBarrel = await fs.readFile(
        join(import.meta.dirname, "../../src", "schemas", "index.ts"),
        "utf-8"
      );
    }
    const newBarrel =
      currentBarrel + `export * from "./generated/${schemaName}.js";\n`;
    await fs.writeFile(
      join(import.meta.dirname, "../../src", "schemas", "index.ts"),
      newBarrel
    );
  }

  async execute() {
    const dbs = await this.fetchDatabases();

    if (dbs.length === 0) {
      this.context.stdout.write("No databases found\n");
      return;
    }

    if (dbs.length > 1 && this.databaseId === undefined) {
      this.context.stdout.write("Please provide a database id\n");
      return;
    }

    if (dbs.length > 1 && this.databaseId !== undefined) {
      const found = await this.db.get(this.databaseId);
      await this.selectDatabase(found);
    }

    if (dbs.length === 1) {
      await this.selectDatabase(dbs[0]);
    }
  }
}
