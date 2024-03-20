import { Meter } from "./meter.mjs";
//import { Note } from "./note.mjs";
import { METER_ATTRIBUTES } from "./consts.mjs";
import { description } from "./attributes.mjs";
import {definePropertiesFromOptions} from "./attribute-extras.mjs"

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
      ...METER_ATTRIBUTES,
    };
  }

  constructor(name, owner, options) {
    if (!name.match(/^[\_\-\w]+$/)) {
      throw new Error("only letters digits '-' and '_' are allowed in names");
    }

    this.name = name;
    this.owner = owner;
    definePropertiesFromOptions(this, options);
  }

  async write(db) {
    const text =
      "INSERT INTO category(name, description) VALUES($1, $2) RETURNING *";
    const values = [this.name, this.description];

    db.query(text, values, (err, res) => {
      if (err) throw err;
    });
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
      await this.getActiveMeter(),
      time,
    ]);
    //return db.put(this.valueKey(time), value);
  }

  async getValue(db, time) {
    return db.get(this.valueKey(time), { asBuffer: false }).catch((err) => { });
  }

  /**
   *
   * @param {levelup} db
   * @param {number} time seconds since epoch
   */
  async deleteValue(db, time) {
    return db.del(this.valueKey(time));
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
   * Get values of the category as ascii text stream with time and value on each line.
   * @param {levelup} db
   * @param {Object} options
   * @param {string} options.gte time of earliest value
   * @param {string} options.lte time of latest value
   * @param {boolean} options.reverse order
   * @return {Readable}
   */
  readStream(db, options) {
    const key = VALUE_PREFIX + this.name + ".";

    return new CategoryValueReadStream(
      db.iterator(readStreamWithTimeOptions(key, options)),
      key.length
    );
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

/*
class CategoryValueReadStream extends Readable {
  constructor(iterator, prefixLength) {
    super();
    Object.defineProperties(this, {
      iterator: { value: iterator },
      prefixLength: { value: prefixLength },
    });
  }
  _read() {
    if (this.destroyed) return;

    this.iterator.next((err, key, value) => {
      if (this.destroyed) return;
      if (err) {
        return this.iterator.end((err2) => callback(err || err2));
      }

      if (key === undefined && value === undefined) {
        this.push(null);
      } else {
        this.push(
          `${parseInt(
            key.toString().slice(this.prefixLength),
            10
          )} ${parseFloat(value.toString())}\n`
        );
      }
    });
  }
}
*/