import { Category } from "@konsumation/model";

export class PostgresCategory extends Category {

  id;
  //TODO
  // DONE return id from insert and create this.id
  // write insert or update values...
  // getactivemeter from id (try without database)
  // list meters
  // meter add and meter delete
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
    const result = await db.query(text, values);
    return this.id=result.rows[0].id
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
  }

  async getValue(db, time) {
    return db.get(this.valueKey(time), { asBuffer: false }).catch(err => {});
  }

  static async entry(db, name) {
    const text = `select * from category where name='${name}'`;
    const result = await db.query(text);
    return new this(name, undefined, result.rows[0]);
    return result.rows.length > 0
      ? new this(name, undefined, result.rows[0])
      : undefined;
  }
}
