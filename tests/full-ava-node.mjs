import test from "ava";
import {
  PostgresMaster,
  PostgresCategory,
  PostgresMeter,
  PostgresNote
} from "@konsumation/db-postgresql";
import {
  testMeterConstructor,
  testInsertListValues
} from "@konsumation/db-test";
import { createSchema, dropSchema } from "./util.mjs";
import { setSchema } from "../src/util.mjs";

const SCHEMA = "test-konsum-full";

test.before(async t => createSchema(process.env.POSTGRES_URL, SCHEMA));
test.after.always(async t => dropSchema(process.env.POSTGRES_URL, SCHEMA));

test("delete category cascade with meter and values", async t => {
  const master = await PostgresMaster.initialize(
    setSchema(process.env.POSTGRES_URL, SCHEMA)
  );

  const category = new PostgresCategory({
    name: `CAT-Update`,
    description: `Category CAT-insert`
  });
  await category.write(master.context);
  t.true(category.id > 0);

  const meter = new PostgresMeter({
    category,
    name: "M1",
    serial: "12345",
    description: `meter for category CAT1`,
    unit: "kwh",
    fractional_digits: 2,
    valid_from: new Date()
  });

  t.is(meter.fractionalDigits, 2);
  t.is(meter.category, category);

  await meter.write(master.context);
  t.true(meter.id > 0);

  await testInsertListValues(t, master, meter, [
    { date: new Date(), value: 234 }
  ]);

  const note = new PostgresNote({
    meter,
    name: new Date().toISOString(),
    description: "note for meter M1"
  });

  await note.write(master.context);

  await category.delete(master.context)

  await master.close();
});
