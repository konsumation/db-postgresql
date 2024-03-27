import { Category } from "@konsumation/model";
import { Meter } from "@konsumation/konsum-db-postgresql";

export class PostgresCategory extends Category {
  id;
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
      await sql`UPDATE category SET ${sql(values, ...names)} WHERE id=${this.id
        }`;
    } else {
      this.id = (
        await sql`INSERT INTO category ${sql(values, ...names)} RETURNING id`
      )[0].id;
    }
  }

  /**
   * Delete record from database.
   * @param {pg} db
   */
  async delete(sql) {
    if (this.id) {
      return sql`DELETE FROM category WHERE id=${this.id}`;
    }
  }

  async addMeter(sql, meter) {
    if (this.id) { return await meter.write(sql, this.id); }
  }

  async deleteMeter(sql) { }

  async *meters(context) {
    for await (const [
      row
    ] of context`SELECT * FROM meter`.cursor()) {
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

  /**
   * Write a time/value pair.
   */
  async writeValue(context, value, time) {
    const insertValue =
      "INSERT INTO values(value, meter, time) VALUES ($1,$2,$3) RETURNING id";
    const obj = {
      value,
      meter: await this.activeMeter(context).id,
      time
    }
    console.log(obj)
    const columns=['value', 'meter', 'time']
    const result = await context`INSERT INTO values ${context(obj, columns)} RETURNING *`;
    console.log(result)
    /*
    .query(insertValue, [
      value,
      await this.activeMeter(context),
      time,
    ]);
    */
  }

  async getValue(db, time) {
    return db.get(this.valueKey(time), { asBuffer: false }).catch((err) => { });
  }

  static async entry(sql, name) {
    const result = await sql`select * from category where name=${name}`;
    return new this({ name, ...result[0] });
  }
}
