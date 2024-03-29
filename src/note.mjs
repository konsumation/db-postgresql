import { Note, id } from "@konsumation/model";

export class PostgresNote extends Note {
  static get attributeNameMapping() {
    return {
      id,
      meter: null,
      "meter.id": "meter_id"
    };
  }

  primaryKeyExpression(sql) {
    return sql({ id: this.id }, "id");
  }

  async write(sql) {
    const values = this.attributeValues;
    const names = Object.keys(values);

    if (this.id) {
      await sql`UPDATE note SET ${sql(
        values,
        ...names
      )} WHERE ${this.primaryKeyExpression(sql)}`;
    } else {
      this.id = (
        await sql`INSERT INTO note ${sql(values, ...names)} RETURNING id`
      )[0].id;
    }
  }
}
