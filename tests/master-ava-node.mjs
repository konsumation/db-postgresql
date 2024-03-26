import test from "ava";
import { Master } from "@konsumation/konsum-db-postgresql";
import { createDatabase } from "./util.mjs";

const url = process.env.POSTGRES_URL + `?currentSchema=myschema`;

test.before(async t => createDatabase(url));

test("initialize", async t => {
  const master = await Master.initialize(url);

  const categories = [];

  for await (const c of master.categories(master.context)) {
    categories.push(c);
  }

  t.truthy(master.db);

  t.deepEqual([], categories);

  await master.close();
});
