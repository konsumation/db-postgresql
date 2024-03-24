import { createReadStream } from "node:fs";
import pg from "pg";
import pcConnectionString from "pg-connection-string";
import { chunksToStatements } from "../src/util.mjs";

async function load(client, chunks) {
  try {
    await client.connect();

    for await (const statement of chunksToStatements(chunks)) {
      console.log(statement);
      const result = await client.query(statement);
      console.log("RESULT",result.rows);
    }

    await client.end();
  } catch (e) {
    console.log(e);
  }
}

const file = "src/sql/schema.sql";
const config = pcConnectionString.parse(process.env.POSTGRES_URL);
const client = new pg.Client(config);

load(client, createReadStream(file, "utf8"));
