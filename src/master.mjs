import { Category } from "./category.mjs";
import { Meter } from "./meter.mjs";

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
 */
  async categories() {
    //await this.db.connect();
    const answer = await this.db.query(
      "SELECT name from category"
    );
      //console.log(answer.rows);
      //await this.db.end();
      return answer.rows
  }

/**
  async *categories() {
    import Cursor from 'pg-cursor'

    const sql = "SELECT name from category";

   this.db.query(new Cursor(sql))

    for await (const row of query) {
      yield row;
    }

  }
 */

}
