import postgres from "postgres";
import { Master } from "@konsumation/model";
import { PostgresCategory } from "./category.mjs";
import { PostgresMeter } from "./meter.mjs";
import { PostgresNote } from "./note.mjs";
import { getSchema } from "./util.mjs";
export { PostgresMaster as Master };
export { PostgresMeter as Meter };
export { PostgresCategory as Category };
export { PostgresNote as Note };

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
      connection: { search_path: getSchema(url, schema) }
    });

    const readVersion = async () =>
      (await context`SELECT schema_version FROM version ORDER BY migrated`)[0]
        .schema_version;

    /**
     * get meta info like schema version
     */

    let version;
    try {
      version = await readVersion();
    } catch (e) {
      switch (e.code) {
        // undefined_table https://www.postgresql.org/docs/current/errcodes-appendix.html
        case "42P01":
          {
            try {
              const result = await context.file(
                new URL("sql/schema.sql", import.meta.url).pathname
              );
              version = await readVersion();
            } catch (e) {
              console.log(e);
            }
          }
          break;
        default:
          console.log(e);
      }
    }

    if (version !== VERSION) {
      throw new Error(`Unsupported schema version: ${version}`);
    }

    return new PostgresMaster(context, version);
  }

  constructor(context, version) {
    super();
    this.context = context;
    this.schemaVersion = version;
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

  async fromText(input) {
    return super.fromText(input, [
      PostgresCategory,
      PostgresMeter,
      PostgresNote
    ]);
  }
}
