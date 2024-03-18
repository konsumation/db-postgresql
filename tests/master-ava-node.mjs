import test from "ava";
import pg from "pg";
import { Postgres } from "@konsumation/konsum-db-postgresql";

const db = new pg.Client({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  //password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

test.only("initialize", async t => {
  const master = await Postgres.initialize(db);

  //t.is(master.schemaVersion, "1.0.0");
  t.is(master.db, db);

  t.deepEqual([], await master.categories());

  //db.close();
});

const SECONDS_A_DAY = 60 * 60 * 24;
