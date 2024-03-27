import { Note } from "@konsumation/model";

export class PostgresNote extends Note {
  async write(sql) {
    const values = this.attributeValues;
    const names = Object.keys(values);

    if (this.time) {
      await sql`UPDATE note SET ${sql(values, ...names)} WHERE date=${this.time}`;
    } else {
      this.id = (
        await sql`INSERT INTO note ${sql(values, ...names)} RETURNING date`
      )[0].time;
    }
  }
}
