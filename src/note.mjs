import { Note, id } from "@konsumation/model";

/**
 *
 */
export class PostgresNote extends Note {
  static get attributeNameMapping() {
    return {
      id,
      "meter.id": "meter_id"
    };
  }

  primaryKeyExpression(sql) {
    // @ts-ignore
    return sql({ id: this.id }, "id");
  }

  async write(sql) {
    const values = this.getLocalAttributes();
    const names = Object.keys(values);

    // @ts-ignore
    if (this.id) {
      await sql`UPDATE note SET ${sql(
        values,
        ...names
      )} WHERE ${this.primaryKeyExpression(sql)}`;
    } else {
      Object.assign(
        this,
        (await sql`INSERT INTO note ${sql(values, ...names)} RETURNING id`)[0]
      );
    }
  }
}
