import QueryStream from "pg-query-stream";
import { Master } from "@konsumation/model";
import { PostgresCategory } from "./category.mjs";
import { PostgresMeter } from "./meter.mjs";
import { executeStatements } from "./util.mjs";
import { createReadStream } from "node:fs";

export { PostgresCategory as Category };
export { PostgresMeter as Meter };
export { PostgresMaster as Master };


const VERSION = "1";

function checkVersion(version) {
  if (version !== VERSION) {
    throw new Error(`Unsupported schema version`);
  }
}

/**
 * Master record.
 * Holds schema version.
 *
 * @property {string} schemaVersion
 */
export class PostgresMaster extends Master {
  db;

  static async initialize(db) {
    /**
     * get meta info like schema version
     */
    //await db.connect();
    let answer;
    try {
      answer = await db.query(
        "SELECT schemaversion FROM version order by migrated"
      )

      console.log(answer);
    } catch (e) {
      if (e.message.match('relation "version" does not exist')) {
        const sql = new URL("sql/schema.sql", import.meta.url).pathname;
        await executeStatements(db, createReadStream(sql, "utf8"), { version: VERSION });
        answer = await db.query(
          "SELECT schemaversion FROM version order by migrated"
        )
      }
    }

    checkVersion(answer?.rows[0].schemaversion);

    const master = new PostgresMaster();
    master.db = db;
    master.schemaVersion = answer.rows[0].schemaversion;
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
      const category = new PostgresCategory(row.name);
      yield category;
    }
    client.release();
  }
}
