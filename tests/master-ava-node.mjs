import test from "ava";
import { Master } from "@konsumation/konsum-db-postgresql";
import { createSchema, dropSchema } from "./util.mjs";

const SCHEMA = "konsum_test_1";

test.before(async t => createSchema(process.env.POSTGRES_URL, SCHEMA));
test.after(async t => dropSchema(process.env.POSTGRES_URL, SCHEMA));

test("initialize", async t => {
  const master = await Master.initialize(process.env.POSTGRES_URL, SCHEMA);

  t.truthy(master.context);

  const categories = [];

  for await (const c of master.categories(master.context)) {
    categories.push(c);
  }

  t.deepEqual([], categories);

  await master.close();
  t.is(master.context, undefined);
});
