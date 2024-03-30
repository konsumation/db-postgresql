import test from "ava";
import { Meter, Master, Category } from "@konsumation/db-postgresql";
import { testMeterConstructor } from "@konsumation/db-test";
import { createSchema, dropSchema } from "./util.mjs";

const SCHEMA = "konsum_meter_test";

test.before(async t => createSchema(process.env.POSTGRES_URL, SCHEMA));
test.after(async t => dropSchema(process.env.POSTGRES_URL, SCHEMA));

test("Meter constructor", t =>
  testMeterConstructor(t, Meter, {
    name: "M1",
    category: new Category({ name: "CAT-1" }),
    fractional_digits: 2,
    valid_from: new Date()
  }));

test("Meter add / delete / update", async t => {
  const master = await Master.initialize(process.env.POSTGRES_URL, SCHEMA);

  const category = new Category({
    name: `CAT-Update`,
    description: `Category CAT-insert`
  });
  await category.write(master.context);
  t.true(category.id > 0);

  const meter = new Meter({
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

  await meter.writeValue(master.context, new Date(), 234);

  await master.close();
});
