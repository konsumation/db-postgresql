import { Note } from "@konsumation/model";

export class PostgresNote extends Note {
  async write(sql) {
    if (this.id) {
      await sql`UPDATE note SET $${sql(
        this.attributeValues,
        ...this.attributeNames
      )} WHERE id=${this.id}`;
    } else {
      this.id = (
        await sql`INSERT INTO note ${sql(
          this.attributeValues,
          ...this.attributeNames
        )} RETURNING id`
      )[0].id;
    }
  }
}
