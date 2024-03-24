import { createReadStream } from "node:fs";
import pg from "pg";
import pcConnectionString from "pg-connection-string";
import { executeStatements } from "../src/util.mjs";

const file = "src/sql/schema.sql";
const config = pcConnectionString.parse(process.env.POSTGRES_URL);
const client = new pg.Client(config);

executeStatements(client, createReadStream(file, "utf8"), { version: "1" });
