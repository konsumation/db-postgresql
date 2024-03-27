import test from "ava";
import { Master, Category, Meter } from "@konsumation/konsum-db-postgresql";
import { testCategoryConstructor } from "@konsumation/db-test";
import { createSchema, dropSchema } from "./util.mjs";

const SCHEMA = "konsum_test_1";

test.before(async t => createSchema(process.env.POSTGRES_URL, SCHEMA));
//test.after(async t => dropSchema(process.env.POSTGRES_URL, SCHEMA));

test("Category constructor", t => testCategoryConstructor(t, Category));

test("Category write / read / update / delete", async t => {
  const master = await Master.initialize(process.env.POSTGRES_URL, SCHEMA);

  for (let i = 0; i < 10; i++) {
    const c = new Category({
      name: `CAT-${i}`,
      description: `Category CAT-${i}`
    });
    await c.write(master.context);
    t.true(c.id > 0);
    t.is(c.description, `Category CAT-${i}`);
  }

  const cs = [];

  for await (const c of master.categories(master.context)) {
    cs.push(c);
  }

  t.true(cs.length >= 10);

  let c = new Category({
    name: `CAT-Update`,
    description: `Category CAT-insert`
  });
  await c.write(master.context);
  t.is(c.description, `Category CAT-insert`);
  c.description = "update";
  c.name = "bla";
  await c.write(master.context);

  c = await Category.entry(master.context, "bla");

  t.is(c.description, `update`);
  t.is(c.name, `bla`);

  c = await Category.entry(master.context, "CAT-12");
  t.is(c.name, `CAT-12`);
  t.is(c.description, undefined)
  await c.delete(master.context);

  await master.close();
});

const SECONDS_A_DAY = 60 * 60 * 24;
test.skip("Meter write / read / update / delete", async t => {
  const master = await Master.initialize(url);
  new Meter();

  await master.close();
});

test.only("values write / read", async t => {
  const master = await Master.initialize(process.env.POSTGRES_URL, SCHEMA);

  const c = new Category({ name: `CAT-1val` });
  await c.write(master.context);

  const m = new Meter({
    serial: "12345",
    description: `meter for category CAT1val`,
    unit: "kwh",
    fractionalDigits: 2,
    validFrom: new Date(),
  });

  await m.write(master.context, c)
  const first = Date.now();
  const firstValue = 77.34;
  let last = first;
  let lastValue = firstValue;

  for (let i = 0; i < 100; i++) {
    last = new Date(first + SECONDS_A_DAY * i).getTime();
    lastValue = firstValue + i;
    await c.writeValue(master.context, lastValue, last);
  }

  let values = [];

  for await (const { value, time } of c.values(master.context)) {
    values.push({ value, time });
  }

  t.true(values.length >= 100);
  t.deepEqual(values[0], { value: firstValue, time: first });

  values = [];
  for await (const { value, time } of c.values(master.context, {
    gte: first + SECONDS_A_DAY * 99,
    reverse: true
  })) {
    values.push({ value, time });
  }
  //t.log("VALUES", values);

  t.is(values.length, 1);
  t.deepEqual(values[0], { value: lastValue, time: last });

  await master.close();
});

test.skip("values delete", async t => {
  const dbf = tmp.tmpNameSync();
  const master = await Postgres.initialize(db);

  const c = new Category(`CAT-2val`, master, { unit: "kWh" });
  await c.write(master.context);

  const first = Date.now();
  const firstValue = 77.34;
  let last = first;
  let lastValue = firstValue;

  for (let i = 0; i < 3; i++) {
    last = new Date(first + SECONDS_A_DAY * i).getTime();
    lastValue = firstValue + i;
    await c.writeValue(master.context, lastValue, last);
  }
  const ds = await c.getValue(master.context, first);
  t.is((await c.getValue(master.context, first)).toString(), "77.34");
  await c.deleteValue(master.context, first);

  t.is(await c.getValue(master.context, first), undefined);

  await master.close();
});

/*
const newValue = {
  value: 10.5,
  meter: 1,
  date: new Date()
};

// INSERT statement
const query = 'INSERT INTO values (value, meter, date) VALUES (?, ?, ?)';
const values = [newValue.value, newValue.meter, newValue.date];

// Execute the INSERT statement
db.query(query, values, (error, result) => {
  if (error) {
    console.error('Error inserting data:', error);
  } else {
    console.log('Data inserted successfully. New row ID:', result.insertId);
  }

  // Close the connection
  //db.end();
});

*/
