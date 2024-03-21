import { Category } from "./category.mjs";
import { Meter } from "./meter.mjs";
import QueryStream from "pg-query-stream";
export {
  Category,
  Meter,
};

function checkVersion(version) {
  if (version !== "1.0.0") {
    throw new Error(`Unsupported schema version `);
  }
}

/**
 * Master record.
 * Holds schema version.
 *
 * @property {string} schemaVersion
 */
export class Postgres {

  static get attributes() {
    return {
      schemaVersion
    };
  }

  static async initialize(db) {
    let meta;
    /**
     * get meta info like schema version
     */
    //await db.connect();

    const answer = await db.query(
      "SELECT appversion FROM version order by migrated"
    );
    //console.log(answer.rows[0].appversion);
    meta = {
      schemaVersion: answer.rows[0].appversion
    };
    checkVersion(answer.rows[0].appversion);

    const master = new Postgres("unnamed", undefined, meta);
    master.db = db;

    return master;
  }


  /**
 * List Categories.

  async *categories() {
    //await this.db.connect();
    const result = await this.db.query(
      "SELECT name from category"
    );
    //console.log(answer.rows);
    //await this.db.end();
    console.log("result:", result.rows)
    for (const row of result.rows) {
      yield row; // Ergebnisse zeilenweise als Generator zurückgeben
    }
    //return answer.rows
  }
 */

  
  async *categories() {
    const sql = "SELECT name from category";

    const stream = new QueryStream(sql, [])
    this.db.query(stream)

    for await (const row of stream) {
      console.log("xxxxx", row)
      yield row;
    }
  }


}
