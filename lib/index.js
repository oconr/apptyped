#!/usr/bin/env node
import { config } from "@dotenvx/dotenvx";
config();
import { Cli } from "clipanion";
import { GenerateCommand } from "./commands/Generate.js";
const [node, app, ...args] = process.argv;
const cli = new Cli({
    binaryLabel: "Appwrite SDK Generator",
    binaryName: `${node} ${app}`,
    binaryVersion: "1.0.0",
});
cli.register(GenerateCommand);
cli.runExit(args);
//# sourceMappingURL=index.js.map