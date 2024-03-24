import { Master } from "@konsumation/model";
import QueryStream from "pg-query-stream";
import { Category } from "./category.mjs";
import { Meter } from "./meter.mjs";
import {executeStatements} from "./util.mjs";
import { createReadStream } from "node:fs";

export { Category, Meter };

function checkVersion(version) {
  if (version !== "1.0.0") {
    throw new Error(`Unsupported schema version`);
  }
}

/**
 * Master record.
 * Holds schema version.
 *
 * @property {string} schemaVersion
 */
export class Postgres extends Master {
  db;

  static async initialize(db) {
    /**
     * get meta info like schema version
     */
    //await db.connect();

    const answer = await db.query(
      "SELECT appversion FROM version order by migrated"
    );
    checkVersion(answer.rows[0].appversion);

    const sql = new URL("sql/schema.sql", import.meta.url).pathname;

    await executeStatements(db, createReadStream(sql, "utf8"), { version: "1" });

    const master = new Postgres();
    master.db = db;
    master.schemaVersion = answer.rows[0].appversion;
    return master;
  }

  /**
   * Close the underlaying database.
   */
  close() {
    return this.db.end();
  }

  async *categories() {
    const sql = "SELECT name from category";
    const stream = new QueryStream(sql, []);
    const client = await this.db.connect();
    client.query(stream);

    for await (const row of stream) {
      const category = new Category(row.name);
      yield category;
    }
    client.release();
  }
}
