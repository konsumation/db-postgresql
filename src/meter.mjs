import { Meter } from "@konsumation/model";

export class PostgresMeter extends Meter {
  async write(sql) {
    if (this.id) {
      await sql`UPDATE mater SET $${sql(
        this.attributeValues,
        ...this.attributeNames
      )} WHERE id=${this.id}`;
    } else {
      this.id = (
        await sql`INSERT INTO meter ${sql(
          this.attributeValues,
          ...this.attributeNames
        )} RETURNING id`
      )[0].id;
    }
  }
}
