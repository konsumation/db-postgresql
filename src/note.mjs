import { Note } from "@konsumation/model";

export class PostgresNote extends Note {

  static get attributeNameMapping() {
    return {
      "meter.id": "meter_id",
      "time": "date"
    };
  }

  primaryKeyExpression(sql) {
    return sql({ date: this.time }, "date");
  }

  async write(sql) {
    const values = { meter_id: this.meter?.id, ...this.attributeValues };
    delete values.meter; // TODO

    const names = Object.keys(values);

    if (this.time) {
      await sql`UPDATE note SET ${sql(
        values,
        ...names
      )} WHERE ${this.primaryKeyExpression(sql)}`;
    } else {
      this.id = (
        await sql`INSERT INTO note ${sql(values, ...names)} RETURNING date`
      )[0].time;
    }
  }
}
