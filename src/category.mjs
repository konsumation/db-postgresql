import { Category } from "@konsumation/model";

export class PostgresCategory extends Category {
  id;

  get primaryKeyAttributeValues() {
    return { id: this.id };
  }

  get primaryKeyAttributeNames() {
    return ['id'];
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
      await sql`UPDATE category SET ${sql(values, ...names)} WHERE ${sql(this.primaryKeyAttributeValues, ...this.primaryKeyAttributeNames)}`;
    } else {
      this.id = (
        await sql`INSERT INTO category ${sql(values, ...names)} RETURNING id`
      )[0].id;
    }
  }

  /**
   * Delete record from database.
   * @param {*} sql
   */
  async delete(sql) {
    if (this.id) {
      return sql`DELETE FROM category WHERE ${sql(this.primaryKeyAttributeValues, ...this.primaryKeyAttributeNames)}`;
    }
  }

  async addMeter(db) {}

  async deleteMeter(db) {}

  async allMeters(db) {}

  async getActiveMeter(db) {
    const getActiveMeterSql = `select id from meter where categoryname='${this.name}' and valid_from = ( select max(valid_from) from meter where categoryname='${this.name}')`;
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

  static async entry(sql, name) {
    const result = await sql`select * from category where name=${name}`;
    return new this({ name, ...result[0] });
  }
}
