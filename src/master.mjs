import postgres from "postgres";
import { Master } from "@konsumation/model";
import { PostgresCategory } from "./category.mjs";
import { PostgresMeter } from "./meter.mjs";
import { PostgresNote } from "./note.mjs";
import { getSchema, setSchema, setDatabase } from "./util.mjs";
export {
  PostgresMeter,
  PostgresNote,
  PostgresCategory,
  getSchema,
  setSchema,
  setDatabase
};

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
      [PostgresCategory.type]: PostgresCategory
    };
  }

  /**
   *
   * @param {string} purl
   * @returns {Promise<PostgresMaster>}
   */
  static async initialize(purl) {
    const { schema, url } = getSchema(purl);
    const context = postgres(url, {
      connection: { 
        search_path: schema,
        client_min_messages: 'ERROR' // TODO why does this not work ?
      }
    });

    /**
     * get meta info like schema version
     */

    async function getInfo() {
      try {
        const info = (await context`SELECT * FROM info ORDER BY created`)[0];
        return info;
      } catch (e) {
        switch (e.code) {
          // undefined_table https://www.postgresql.org/docs/current/errcodes-appendix.html
          case "42P01":
            {
              try {
                await context.file(
                  new URL("sql/schema.sql", import.meta.url).pathname
                );

                const info = { version: VERSION };

                // @ts-ignore
                await context`INSERT INTO info ${context(
                  info,
                  Object.keys(info)
                )}`;

                return info;
              } catch (e) {
                console.error(e);
              }
            }
            break;
          default:
            console.error(e);
        }

        return {};
      }
    }

    let info = await getInfo();

    if (info.version !== VERSION) {
      if (info.version !== undefined) {
        await context.file(
          new URL(`sql/migrate-${info.version}-${VERSION}.sql`, import.meta.url)
            .pathname
        );

        info = await getInfo();
      }
      if (info.version !== VERSION) {
        throw new Error(`Unsupported schema version: ${info.version}`);
      }
    }

    return new PostgresMaster(info, context);
  }

  constructor(values, context) {
    super(values);
    this.context = context;
  }

  async write(sql) {
    const values = this.getAttributes();
    return sql`UPDATE info SET ${sql(
      values,
      "description"
    )} WHERE version=${VERSION}`;
  }

  /**
   * Close the underlaying database.
   */
  async close() {
    await this.context.end();
    this.context = undefined;
  }

  /**
   *
   * @param {any} context
   */
  async *categories(context) {
    for await (const [row] of this.context`SELECT * FROM category`.cursor()) {
      yield new PostgresCategory(row);
    }
  }
}

export default PostgresMaster;
