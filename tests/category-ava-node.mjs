import test from "ava";
import { Master, Category, Meter } from "@konsumation/konsum-db-postgresql";

import { prepareDBSchemaFor } from "../src/util.mjs"

const db = await prepareDBSchemaFor("category");
const master = await Master.initialize(db);

test("Category constructor", async t =>{
    const c = new Category({
    name: `CAT-constructor`,
    description: `Category insert`
  });
t.is(c.name,"CAT-constructor")
t.is(c.description,"Category insert")
});


test("Category write / read / update / delete", async t => {
  //const master = await Master.initialize(db);

  for (let i = 0; i < 10; i++) {
    const c = new Category({
      name: `CAT-${i}`,
      description: `Category CAT-${i}`
    });
    await c.write(master.db);
    t.is(c.id, i+1)
    t.is(c.description,`Category CAT-${i}`)
  }

  const cs = [];

  for await (const c of master.categories()) {
    cs.push(c);
  }

  t.true(cs.length >= 10);
  //t.is(cs[0].unit, "kWh");
  //t.is(cs[0].fractionalDigits, 3);
  let c = await Category.entry(master.db, "CAT-7");
  t.is(c.name, "CAT-7");
  //t.is(c.unit, "kWh");
  //t.is(c.fractionalDigits, 3);

  c = await Category.entry(master.db, "CAT-12");
  //t.falsy(c);

  await c.delete(master.db);

  // await master.backup(createWriteStream('/tmp/x.txt',{ encoding: "utf8" }));

  c = await Category.entry(master.db, "CAT-7");
  //t.falsy(c);
  for (let i = 0; i < 2; i++) {
    const c = new Category( {
      name: `CAT-update`,
      description: `Category CAT-${i}`
    });
    await c.write(master.db);
    t.is(c.description, `Category CAT-${i}`)
  }


  await master.close();
});

const SECONDS_A_DAY = 60 * 60 * 24;

test("values write / read", async t => {
  //const master = await Master.initialize(db);

  const c = new Category({name: `CAT-1val`});
  await c.write(master.db);

  const first = Date.now();
  const firstValue = 77.34;
  let last = first;
  let lastValue = firstValue;

  for (let i = 0; i < 100; i++) {
    last = new Date(first + SECONDS_A_DAY * i).getTime();
    lastValue = firstValue + i;
    await c.writeValue(master.db, lastValue, last);
  }

  let values = [];

  for await (const { value, time } of c.values(master.db)) {
    values.push({ value, time });
  }

  t.true(values.length >= 100);
  t.deepEqual(values[0], { value: firstValue, time: first });

  values = [];
  for await (const { value, time } of c.values(master.db, {
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
  await c.write(master.db);

  const first = Date.now();
  const firstValue = 77.34;
  let last = first;
  let lastValue = firstValue;

  for (let i = 0; i < 3; i++) {
    last = new Date(first + SECONDS_A_DAY * i).getTime();
    lastValue = firstValue + i;
    await c.writeValue(master.db, lastValue, last);
  }
  const ds = await c.getValue(master.db, first);
  t.is((await c.getValue(master.db, first)).toString(), "77.34");
  await c.deleteValue(master.db, first);

  t.is(await c.getValue(master.db, first), undefined);

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