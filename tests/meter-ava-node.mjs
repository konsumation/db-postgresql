import test from "ava";
import {
  PostgresMaster,
  PostgresCategory,
  PostgresMeter
} from "@konsumation/db-postgresql";
import {
  testMeterConstructor,
  testInsertListValues
} from "@konsumation/db-test";
import { createSchema, dropSchema } from "./util.mjs";
import { setSchema } from "../src/util.mjs";

const SCHEMA = "test-konsum-meter";

test.before(async t => createSchema(process.env.POSTGRES_URL, SCHEMA));
test.after.always(async t => dropSchema(process.env.POSTGRES_URL, SCHEMA));

test.only("Meter constructor", t =>
  testMeterConstructor(t, PostgresMeter, {
    name: "M1",
    category: new PostgresCategory({ name: "CAT-1" }),
    fractionalDigits: 4,
    validFrom: new Date(3600000)
  }));

test("Meter add / delete / update", async t => {
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

  await master.close();
});
