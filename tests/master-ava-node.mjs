import test from "ava";
import { Postgres } from "@konsumation/konsum-db-postgresql";
import { prepareDBSchemaFor } from "../src/util.mjs"

const db = await prepareDBSchemaFor("master");

test("initialize", async t => {

  //const db = new pg.Client({})
  //await db.connect();
  const master = await Postgres.initialize(db);

  //t.is(master.schemaVersion, "1.0.0");
  t.is(master.db, db);

  t.deepEqual([], await master.categories());
  await db.end();
});

const SECONDS_A_DAY = 60 * 60 * 24;
