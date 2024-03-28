import test from "ava";
import { Meter, Master, Category } from "@konsumation/konsum-db-postgresql";
import { testMeterConstructor } from "@konsumation/db-test";
import { createSchema, dropSchema } from "./util.mjs";

const SCHEMA = "konsum_meter_test";

test.before(async t => createSchema(process.env.POSTGRES_URL, SCHEMA));
test.after(async t => dropSchema(process.env.POSTGRES_URL, SCHEMA));

test("Meter constructor", t =>
  testMeterConstructor(t, Meter, {
    category: new Category({ name: "CAT-1" }),
    fractional_digits: 2,
    valid_from: new Date()
  }));

test.only("Meter add / delete / update", async t => {
  const master = await Master.initialize(process.env.POSTGRES_URL, SCHEMA);

  const category = new Category({
    name: `CAT-Update`,
    description: `Category CAT-insert`
  });
  await category.write(master.context);
  t.true(category.id > 0);

  const values = {
    category,
    serial: "12345",
    description: `meter for category CAT1`,
    unit: "kwh",
    fractional_digits: 2,
    valid_from: new Date()
  };

  const meter = new Meter(values);

  t.is(meter.fractionalDigits, 2);
  t.is(meter.category, category);

  await meter.write(master.context);
  t.true(meter.id > 0);
  let c = new Category({
    name: `CAT-Update`,
    description: `Category CAT-insert`
  });
  await c.write(master.context);
  t.is(c.id, 1)
  await m.write(master.context, c);
  t.is(m.id, 1);
  await m.writeValue(master.context, 234, "22.01.2098")

  /*
  await m.writeValue(master.context, 234, new Date())
*/

  await master.close();
});
