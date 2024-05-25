import test from "ava";
import {
  PostgresMaster,
  PostgresCategory,
  PostgresMeter,
  PostgresValue,
} from "@konsumation/db-postgresql";
import { createSchema, dropSchema } from "./util.mjs";
import { setSchema } from "../src/util.mjs";

const SCHEMA = "test-konsum-value";

test.before(async (t) => createSchema(process.env.POSTGRES_URL, SCHEMA));
test.after.always(async t => dropSchema(process.env.POSTGRES_URL, SCHEMA));

test("Value insert / delete / update", async (t) => {
  const master = await PostgresMaster.initialize(
    setSchema(process.env.POSTGRES_URL, SCHEMA)
  );
  const context = master.context;
  const category = new PostgresCategory({
    name: `CAT-Update`,
    description: `Category CAT-insert`,
  });
  await category.write(context);
  t.true(category.id > 0);

  const meter = new PostgresMeter({
    category,
    name: "M1",
    serial: "12345",
    description: `meter for category CAT1`,
    unit: "kwh",
    fractional_digits: 2,
    valid_from: new Date(),
  });

  t.is(meter.fractionalDigits, 2);
  t.is(meter.category, category);

  await meter.write(context);
  t.true(meter.id > 0);

  const today = new Date();
  const val3 = { date: today.setDate(today.getDate() - 1), value: 333 };
  const val2 = { date: today.setDate(today.getDate() - 1), value: 222 };
  const val1 = { date: today, value: 111 };
  
  const v1 = meter.addValue(context, val1);
  await v1.write(context);

  val2.meter = meter;
  const v2 = new PostgresValue(val2);
  await v2.write(context);

  val3.meter=meter;
  const v3 = new PostgresValue(val3);
  await v3.write(context);

  await v1.delete(context)
  t.is(await meter.value(context, today), undefined);
  await master.close();
});
