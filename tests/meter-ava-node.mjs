import test from "ava";
import { Meter, Master, Category } from "@konsumation/konsum-db-postgresql";
import { testMeterConstructor } from "@konsumation/db-test";
import { createSchema, dropSchema } from "./util.mjs";

const SCHEMA = "konsum_meter_test";

test.before(async t => createSchema(process.env.POSTGRES_URL, SCHEMA));
test.after(async t => dropSchema(process.env.POSTGRES_URL, SCHEMA));

test("Meter constructor", t =>
  testMeterConstructor(t, Meter, {
    /*categoryid: 1*/
  }));

test("Meter add / delete / update", async t => {
  const master = await Master.initialize(process.env.POSTGRES_URL, SCHEMA);

  const values = {
    serial: "12345",
    description: `meter for category CAT1`,
    unit: "kwh",
    fractional_digits: 2,
    valid_from: new Date()
  };
  const m = new Meter(values);

  t.is(m.fractionalDigits, 2);

  let c = new Category({
    name: `CAT-Update`,
    description: `Category CAT-insert`
  });
  await c.write(master.context);
  t.is(c.id,1)
  await m.write(master.context,c);

  

  await master.close();
});
