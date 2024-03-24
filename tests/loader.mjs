import { createReadStream } from "node:fs";
import pg from "pg";
import pcConnectionString from "pg-connection-string";
import { chunksToStatements } from "../src/util.mjs";

async function load(client, chunks, properties) {
  try {
    await client.connect();

    for await (let statement of chunksToStatements(chunks)) {
      statement = statement.replaceAll(/:\(\w+\)/g, key => properties[key]);

      console.log(statement);
      const result = await client.query(statement);
      console.log("RESULT", result.rows);
    }

  } catch (e) {
    console.log(e);
  }
  finally {
    await client.end();
  }
}

const file = "src/sql/schema.sql";
const config = pcConnectionString.parse(process.env.POSTGRES_URL);
const client = new pg.Client(config);

load(client, createReadStream(file, "utf8"), { version: "1" });
