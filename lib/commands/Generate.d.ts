import { Command } from "clipanion";
export declare class GenerateCommand extends Command {
    static paths: string[][];
    private client;
    private db;
    databaseId: string;
    constructor();
    private toCamelCase;
    private fetchDatabases;
    private fetchCollections;
    private selectDatabase;
    private generateAttributeType;
    private generateClass;
    execute(): Promise<void>;
}
//# sourceMappingURL=Generate.d.ts.map