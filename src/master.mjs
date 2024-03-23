import { Master} from "@konsumation/model";
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
export class Postgres extends Master {

  db;
  
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
   * Close the underlaying database.
   */
  close() {
    return this.db.end();
  }

  async *categories() {
    const sql = "SELECT name from category";
    const stream = new QueryStream(sql, [])
    const client = await this.db.connect()
    client.query(stream)

    for await (const row of stream) {
      yield row;
    }
    client.release()

  }


}
