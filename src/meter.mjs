import { Meter } from "@konsumation/model";

export class PostgresMeter extends Meter {
  async write(sql) {
    const values = this.attributeValues;
    const names = Object.keys(values);

    if (this.id) {
      await sql`UPDATE meter SET ${sql(values, ...names)} WHERE id=${this.id}`;
    } else {
      this.id = (
        await sql`INSERT INTO meter ${sql(values, ...names)} RETURNING id`
      )[0].id;
    }
  }
}
