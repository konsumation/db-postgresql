import { Meter } from "@konsumation/model";

export class PostgresMeter extends Meter {
  static get attributeNameMapping() {
    return { fractionalDigits: "fractional_digits", validFrom: "valid_from" };
  }

  get primaryKeyAttributeValues() {
    return { id: this.id };
  }

  get primaryKeyAttributeNames() {
    return ["id"];
  }

  async write(sql, categoryid) {
    const values = { categoryid, ...this.attributeValues };
    const names = Object.keys(values);

    if (this.id) {
      await sql`UPDATE meter SET ${sql(values, ...names)} WHERE ${sql(
        this.primaryKeyAttributeValues,
        ...this.primaryKeyAttributeNames
      )}`;
    } else {
      this.id = (
        await sql`INSERT INTO meter ${sql(values, ...names)} RETURNING id`
      )[0].id;
    }
  }

  /**
   * Delete record from database.
   * @param {*} sql
   */
  async delete(sql) {
    if (this.id) {
      return sql`DELETE FROM meter WHERE ${sql(
        this.primaryKeyAttributeValues,
        ...this.primaryKeyAttributeNames
      )}`;
    }
  }
}
