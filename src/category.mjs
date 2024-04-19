import { Category, Meter, id } from "@konsumation/model";
import { PostgresMeter } from "@konsumation/db-postgresql";

/**
 *
 */
export class PostgresCategory extends Category {
  static get factories() {
    return {
      [PostgresMeter.type]: PostgresMeter
    };
  }

  static get attributes() {
    return {
      ...super.attributes,
      id
    };
  }

  static get attributeNameMapping() {
    return {
      fractionalDigits: "fractional_digits",
      validFrom: "valid_from"
    };
  }

  primaryKeyExpression(sql) {
    // @ts-ignore
    return sql({ id: this.id }, "id");
  }

  //TODO
  // DONE return id from insert and create this.id
  // DONE write insert or update values...
  // getactivemeter from id (try without database)
  // list meters
  // meter add and meter delete
  /**
   * Add category record to database.
   * @param {*} sql
   * @returns {Promise<void>}
   */
  async write(sql) {
    //TODO check if columns are changed?

    const values = this.getLocalAttributes(this.constructor.attributeNameMapping);
    const names = Object.keys(values);

    // @ts-ignore
    if (this.id) {
      await sql`UPDATE category SET ${sql(
        values,
        ...names
      )} WHERE ${this.primaryKeyExpression(sql)}`;
    } else {
      Object.assign(
        this,
        (
          await sql`INSERT INTO category ${sql(values, ...names)} RETURNING id`
        )[0]
      );
    }
  }

  /**
   * Delete record from database.
   * @param {*} sql
   */
  async delete(sql) {
    // @ts-ignore
    if (this.id) {
      return sql`DELETE FROM category WHERE ${this.primaryKeyExpression(sql)}`;
    }
  }

  async deleteMeter(sql) {}

  /**
   * Get Meters of the category.
   * @param {any} sql
   * @param {Object} [options]
   * @param {string} [options.gte] from name
   * @param {string} [options.lte] up to name
   * @param {boolean} [options.reverse] order
   * @return {AsyncIterable<Meter>}
   */
  async *meters(sql, options) {
    for await (const [
      row
      // @ts-ignore
    ] of sql`SELECT * FROM meter WHERE category_id=${this.id}`.cursor()) {
      row.category = this;
      yield new PostgresMeter(row);
    }
  }

  /* use from extended vlass
  async getActiveMeter(sql) {
    const getActiveMeterSql = `select id from meter where categoryname='${this.name}' and validfrom = ( select max(validfrom) from meter where categoryname='${this.name}')`;
    const answer = await db.query(getActiveMeterSql);
    return answer.rows[0];
  }
  */

  static async entry(sql, name) {
    const result = await sql`select * from category where name=${name}`;
    return new this({ name, ...result[0] });
  }
}
