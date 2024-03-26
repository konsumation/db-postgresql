import test from "ava";
import { Meter } from "@konsumation/konsum-db-postgresql";
import { createDatabase } from "./util.mjs";


const url = process.env.POSTGRES_URL + `?currentSchema=myschema`;

test.before(async t => createDatabase(url));

test("Meter constructor", async t => {
  //const master = await Master.initialize(url);
  const date = new Date();
  const m = new Meter({
    serial: "12345",
    categoryid: 1,
    description: `meter for category CAT1`,
    unit: "kwh",
    fractionalDigits: 2,
    validFrom: date
  });
  t.is(m.fractionalDigits, 2)
  t.is(m.serial, "12345")
  t.is(m.description, "meter for category CAT1")
  t.is(m.unit, "kwh")
  t.is(m.validFrom, date)


  //await master.close();
});
