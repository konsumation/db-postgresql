import { Meter } from "@konsumation/model";

export class PostgresMeter extends Meter {
  static get attributeNameMapping() {
    return { fractionalDigits: "fractional_digits", validFrom: "valid_from" };
  }

  async write(sql, category) {
    const values = { categoryid:category.id, ...this.attributeValues };
    const names = Object.keys(values);

    if (this.id) {
      await sql`UPDATE meter SET ${sql(values, ...names)} WHERE id=${this.id}`;
    } else {
      this.id = (
        await sql`INSERT INTO meter ${sql(values, ...names)} RETURNING id`
      )[0].id;
    }
  }

  static async entry(sql, name) {
    const result = await sql`select * from meter where name=${name}`;
    return new this({ name, ...result[0] });
  }
}
