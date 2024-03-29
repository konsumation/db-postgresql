import test from "ava";
import { Meter, Master, Category } from "@konsumation/konsum-db-postgresql";
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

test.only("Meter add / delete / update", async t => {
  const master = await Master.initialize(process.env.POSTGRES_URL, SCHEMA);

  const c = new Category({
    name: `CAT-Update`,
    description: `Category CAT-insert`
  });
  await c.write(master.context);
  t.true(c.id > 0);

  const values = {
    category:c,
    name: "M1",
    serial: "12345",
    description: `meter for category CAT1`,
    unit: "kwh",
    fractional_digits: 2,
    valid_from: new Date()
  };

  const meter = new Meter(values);

  t.is(meter.fractionalDigits, 2);
  t.is(meter.category, c);

  await meter.write(master.context);
  t.true(meter.id > 0);

  await c.write(master.context);
  t.is(c.id, 1)
  await meter.write(master.context, c);
  t.is(meter.id, 1);
  await meter.writeValue(master.context, 234, new Date())

  /*
  await m.writeValue(master.context, 234, new Date())
*/

  await master.close();
});
