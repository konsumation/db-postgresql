import QueryStream from "pg-query-stream";
import ConnectionString from "pg-connection-string";
import pg from "pg";
import { Master } from "@konsumation/model";
import { PostgresCategory } from "./category.mjs";
import { PostgresMeter } from "./meter.mjs";
import { executeStatements } from "./util.mjs";
import { createReadStream } from "node:fs";

export { PostgresCategory as Category };
export { PostgresMeter as Meter };
export { PostgresMaster as Master };

const VERSION = "1";

/**
 * Master record.
 * Holds schema version.
 *
 * @property {string} schemaVersion
 */
export class PostgresMaster extends Master {
  db;

  static async initialize(config) {
    if (typeof config === "string") {
      config = ConnectionString.parse(config);
    }

    const db = new pg.Pool(config);

    async function readVersion() {
      const answer = await db.query(
        "SELECT schemaversion FROM version order by migrated"
      );
      return answer?.rows[0].schemaversion;
    }

    /**
     * get meta info like schema version
     */

    let version;
    try {
      version = await readVersion();
    } catch (e) {
      // undefined_table https://www.postgresql.org/docs/current/errcodes-appendix.html
      if (e.code === "42P01") {
        const sql = new URL("sql/schema.sql", import.meta.url).pathname;
        await executeStatements(db, createReadStream(sql, "utf8"), {
          version: VERSION
        });
        version = await readVersion();
      }
    }

    if (version !== VERSION) {
      throw new Error(`Unsupported schema version: ${version}`);
    }

    const master = new PostgresMaster();
    master.db = db;
    master.schemaVersion = version;
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
