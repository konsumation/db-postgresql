import { Master } from "@konsumation/model";
import { PostgresCategory } from "./category.mjs";
import { PostgresMeter } from "./meter.mjs";
import postgres from "postgres";
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
  context;

  static async initialize(url, schema) {
    const context = postgres(url, {
      connection: { search_path: schema }
    });

    const readVersion = async () =>
      (await context`SELECT schemaversion FROM version ORDER BY migrated`)[0]
        .schemaversion;

    /**
     * get meta info like schema version
     */

    let version;
    try {
      version = await readVersion();
    } catch (e) {
      //console.log(e);

      // undefined_table https://www.postgresql.org/docs/current/errcodes-appendix.html
      if (e.code === "42P01") {
        try {
          const result = await context.file(
            new URL("sql/schema.sql", import.meta.url).pathname
          );
          version = await readVersion();
        } catch (e) {
          console.log(e);
        }

        //  console.log(context);
      }
    }

    console.log("Version", version);
    if (version !== VERSION) {
      throw new Error(`Unsupported schema version: ${version}`);
    }

    const master = new PostgresMaster();
    master.context = context;
    master.schemaVersion = version;
    return master;
  }

  /**
   * Close the underlaying database.
   */
  async close() {
    await this.context.end();
    this.context = undefined;
  }

  async *categories(context) {
    for await (const [
      row
    ] of context`SELECT name,description FROM category`.cursor()) {
      yield new PostgresCategory(row);
    }
  }
}
