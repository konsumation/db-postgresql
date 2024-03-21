import test from "ava";
import { Postgres, Category } from "@konsumation/konsum-db-postgresql";

import { prepareDBSchemaFor } from "../src/util.mjs"

const db = await prepareDBSchemaFor("category", false);

test.only("Category write / read / delete", async t => {
  const master = await Postgres.initialize(db);

  /*
  const result = await master.db.query(
    "SELECT name from category"
  );

  console.log("result:", result.rows)
  */
  const cs = [];

  for await (const c of master.categories()) {
    console.log('test',c.name)
    cs.push(c);
  }
  master.db.end()
  console.log(cs)
})

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