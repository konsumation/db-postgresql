import { Category, id } from "@konsumation/model";
import { Meter } from "@konsumation/db-postgresql";

/**
 *
 */
export class PostgresCategory extends Category {
  //id;

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
   * @returns
   */
  async write(sql) {
    //TODO check if columns are changed?

    const values = this.attributeValues;
    const names = Object.keys(values);

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
    if (this.id) {
      return sql`DELETE FROM category WHERE ${this.primaryKeyExpression(sql)}`;
    }
  }

  async addMeter(sql, meter) {
    meter.category = this;
  }

  async deleteMeter(sql) {}

  async *meters(sql) {
    for await (const [
      row
    ] of sql`SELECT * FROM meter WHERE category_id=${this.id}`.cursor()) {
      row.category = this;
      yield new Meter(row);
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
