import { Meter, id } from "@konsumation/model";
import { PostgresNote } from "./note.mjs";

/**
 *
 */
export class PostgresMeter extends Meter {
  static get factories() {
    return {
      [PostgresNote.type]: PostgresNote
    };
  }

  static get attributeNameMapping() {
    return {
      fractionalDigits: "fractional_digits",
      validFrom: "valid_from",
      category: null,
      "category.id": "category_id"
    };
  }

  static get attributes() {
    return {
      ...super.attributes,
      id
    };
  }

  primaryKeyExpression(sql) {
    // @ts-ignore
    return sql({ id: this.id }, "id");
  }

  async write(sql) {
    const values = this.getAttributes();
    const names = Object.keys(values);

    // @ts-ignore
    if (this.id) {
      await sql`UPDATE meter SET ${sql(
        values,
        ...names
      )} WHERE ${this.primaryKeyExpression(sql)}`;
    } else {
      Object.assign(
        this,
        (await sql`INSERT INTO meter ${sql(values, ...names)} RETURNING id`)[0]
      );
    }
  }

  //TODO where clause on primary key?
  static async entry(sql, name) {
    const result = await sql`SELECT * FROM meter WHERE name=${name}`;
    return new this({ name, ...result[0] });
  }
  /**
   * Delete record from database.
   * @param {*} sql
   */
  async delete(sql) {
    // @ts-ignore
    if (this.id) {
      return sql`DELETE FROM meter WHERE ${this.primaryKeyExpression(sql)}`;
    }
  }

  /**
   * Write a time/value pair.
   */
  async addValue(context, attributes) {
    await context`INSERT INTO "values"${context(
      {
        // @ts-ignore
        meter_id: this.id,
        ...attributes
      },
      "meter_id",
      "value",
      "date"
    )}`;
  }

  /**
   * Get values of the meter.
   * @param {any} context
   * @param {Object} [options]
   * @param {string} [options.gte] time of earliest value
   * @param {string} [options.lte] time of latest value
   * @param {boolean} [options.reverse] order
   * @return {AsyncIterable<{value:number, date: Date}>}
   */
  async *values(context, options) {
    // @ts-ignore
    for await (const row of context`SELECT date,value FROM values WHERE meter_id=${this.id}`.cursor()) {
      yield row[0];
    }
  }
}
