import test from "ava";
import {
  PostgresMaster,
  PostgresCategory,
  PostgresMeter,
  PostgresNote
} from "@konsumation/db-postgresql";
import { testNoteConstructor } from "@konsumation/db-test";
import { createSchema, dropSchema } from "./util.mjs";

const SCHEMA = "konsum_note_test";

test.before(async t => createSchema(process.env.POSTGRES_URL, SCHEMA));
test.after(async t => dropSchema(process.env.POSTGRES_URL, SCHEMA));

test("Note constructor", t =>
  testNoteConstructor(t, PostgresNote, { }));

test("Note add / delete / update", async t => {
  const master = await PostgresMaster.initialize(process.env.POSTGRES_URL, SCHEMA);

  const category = new PostgresCategory({
    name: "CAT-Update",
    description: "Category CAT-insert"
  });
  await category.write(master.context);
  t.true(category.id > 0);

  const meter = new PostgresMeter({
    category,
    name: "M1",
    serial: "12345",
    description: "meter for category CAT1",
    unit: "kwh",
    fractional_digits: 2,
    valid_from: new Date()
  });
  await meter.write(master.context);
  t.true(meter.id > 0);

  const note = new PostgresNote({
    meter,
    name: new Date().toISOString(),
    description: "note for meter M1"
  });

  t.is(note.meter, meter);
  t.is(note.meter.id, 1);
  await note.write(master.context);

  await master.close();
});
