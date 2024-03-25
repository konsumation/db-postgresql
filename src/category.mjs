import { Meter } from "./meter.mjs";
//import { Note } from "./note.mjs";
import { METER_ATTRIBUTES } from "./consts.mjs";
import { description } from "./attributes.mjs";

/**
 * Value Category.
 * @param {string} name category name
 * @param {Object} options
 * @param {string} options.description
 * @param {string} options.unit physical unit like kWh or m3
 * @param {number} options.fractionalDigits display precission
 *
 * @property {string} name category name
 * @property {string} description
 * @property {string} unit physical unit
 * @property {number} fractionalDigits display precission
 */
export class Category {
  static get attributes() {
    return {
      description,
      ...METER_ATTRIBUTES
    };
  }

  constructor(name) {
    this.name = name;
  }

  /**
   * Add category record to database.
   * @param {*} db
   * @returns
   */
  async write(db) {
    const text =
      "INSERT INTO category(name, description) VALUES($1, $2) RETURNING *";
    const values = [this.name, this.description];
    //TODO check result output from query and throw error if needed
    return db.query(text, values);
  }

  /**
   * Delete record from database.
   * @param {pg} db
   */
  async delete(db) {
    const text = `delete from category where name='${this.name}' RETURNING *`;
    //TODO check result output from query and throw error if needed
    return db.query(text);
  }

  async getActiveMeter(db) {
    const getActiveMeterSql = `select id from meter where categoryname='${this.name}' and validfrom = ( select max(validfrom) from meter where categoryname='${this.name}')`;
    const answer = await db.query(getActiveMeterSql);
    return answer.rows[0];
  }
  /**
   * Write a time/value pair.
   */
  async writeValue(db, value, time) {
    const insertValue =
      "INSERT INTO values(value, meter, time) VALUES ($1,$2,$3) RETURNING id";
    const answer = await db.query(insertValue, [
      value,
      await this.getActiveMeter(db),
      time
    ]);
    //return db.put(this.valueKey(time), value);
  }

  async getValue(db, time) {
    return db.get(this.valueKey(time), { asBuffer: false }).catch(err => {});
  }

  /**
   *
   * @param {levelup} db
   * @param {number} time seconds since epoch
   */
  async deleteValue(db, time) {
    return db.del(this.valueKey(time));
  }

  static async entry(db, name) {
    const text = `select * from category where name='${name}'`;
    const result = await db.query(text);

    return new this(name, undefined, result.rows[0]);
    return result.rows.length > 0
      ? new this(name, undefined, result.rows[0])
      : undefined;
  }

  /**
   * Get values of the category.
   * @param {levelup} db
   * @param {Object} options
   * @param {string} options.gte time of earliest value
   * @param {string} options.lte time of latest value
   * @param {boolean} options.reverse order
   * @return {AsyncIterable<Object>}
   */
  async *values(db, options) {
    const key = VALUE_PREFIX + this.name + ".";
    const prefixLength = key.length;

    for await (const data of db.createReadStream(
      readStreamWithTimeOptions(key, options)
    )) {
      const value = parseFloat(data.value.toString());
      const time = parseInt(data.key.toString().slice(prefixLength), 10);
      yield { value, time };
    }
  }

  /**
   * Get Meters of the category.
   * @param {levelup} db
   * @param {Object} options
   * @param {string} options.gte from name
   * @param {string} options.lte up to name
   * @param {boolean} options.reverse order
   * @return {AsyncIterable<Meter>}
   */
  async *meters(db, options) {
    yield* this.readDetails(Meter, db, options);
  }

  /**
   * Get Notes of the category.
   * @param {levelup} db
   * @param {Object} options
   * @param {string} options.gte time
   * @param {string} options.lte up to time
   * @param {boolean} options.reverse order
   * @return {AsyncIterable<Meter>}
   */
  async *notes(db, options) {
    yield* this.readDetails(Note, db, options);
  }
}
