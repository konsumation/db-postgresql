import postgres from "postgres";
import { Master } from "@konsumation/model";
import { PostgresCategory } from "./category.mjs";
import { PostgresMeter } from "./meter.mjs";
import { PostgresNote } from "./note.mjs";
import { getSchema } from "./util.mjs";
export { PostgresMeter, PostgresNote, PostgresCategory };

const VERSION = "1";

/**
 * Master record.
 * Holds schema version.
 *
 * @property {string} schemaVersion
 */
export class PostgresMaster extends Master {
  static get name() {
    return "postgresql";
  }

  static get factories() {
    return {
      [PostgresCategory.typeName]: PostgresCategory
    };
  }

  /**
   * 
   * @param {string} url 
   * @param {string} [schema] 
   * @returns {Promise<PostgresMaster>}
   */
  static async initialize(url, schema) {
    const context = postgres(url, {
      //client_min_messages: 'ERROR',
      connection: { search_path: getSchema(url, schema) }
    });

    let values;

    /**
     * get meta info like schema version
     */

    try {
      values = (
        await context`SELECT version,description FROM info ORDER BY created`
      )[0];
    } catch (e) {
      switch (e.code) {
        // undefined_table https://www.postgresql.org/docs/current/errcodes-appendix.html
        case "42P01":
          {
            try {
              await context.file(
                new URL("sql/schema.sql", import.meta.url).pathname
              );

              values = { version: VERSION };

              // @ts-ignore
              await context`INSERT INTO info ${context(
                values,
                Object.keys(values)
              )}`;
            } catch (e) {
              console.log(e);
            }
          }
          break;
        default:
          console.log(e);
      }
    }

    if (values?.version !== VERSION) {
      throw new Error(`Unsupported schema version: ${values?.version}`);
    }

    return new PostgresMaster(values, context);
  }

  constructor(values, context) {
    super(values);
    this.context = context;
  }

  /**
   * Close the underlaying database.
   */
  async close() {
    await this.context.end();
    this.context = undefined;
  }

  async *categories() {
    for await (const [row] of this
      .context`SELECT id,name,description FROM category`.cursor()) {
      yield new PostgresCategory(row);
    }
  }
}

export default PostgresMaster;