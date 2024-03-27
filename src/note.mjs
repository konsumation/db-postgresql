import { Note } from "@konsumation/model";

export class PostgresNote extends Note {
  async write(sql) {
    const values = this.attributeValues;
    const names = Object.keys(values);

    if (this.id) {
      await sql`UPDATE note SET ${sql(values, ...names)} WHERE id=${this.id}`;
    } else {
      this.id = (
        await sql`INSERT INTO note ${sql(values, ...names)} RETURNING id`
      )[0].id;
    }
  }
}
