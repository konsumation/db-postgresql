import test from "ava";
import { PostgresMaster, PostgresCategory } from "@konsumation/db-postgresql";
import {
  testCategoryConstructor,
  testCreateCategories
} from "@konsumation/db-test";
import { createSchema, dropSchema } from "./util.mjs";
import { setSchema } from "../src/util.mjs";

const SCHEMA = "konsum_test_1";

test.before(async t => createSchema(process.env.POSTGRES_URL, SCHEMA));
test.after(async t => dropSchema(process.env.POSTGRES_URL, SCHEMA));

test("Category constructor", t =>
  testCategoryConstructor(t, PostgresCategory, { fractional_digits: 2 })); // TODO defaults

test("Category write / read / update / delete", async t => {
  const master = await PostgresMaster.initialize(
    setSchema(process.env.POSTGRES_URL, SCHEMA)
  );

  const categories = await testCreateCategories(
    t,
    master,
    Array.from({ length: 10 }, (_, i) => `CAT-${i}`),
    {},
    (t, category) => t.true(category.id > 0)
  );

  const cs = [];

  for await (const c of master.categories(master.context)) {
    cs.push(c);
  }

  t.true(cs.length >= categories.length);

  let c = new PostgresCategory({
    name: `CAT-Update`,
    description: `Category CAT-insert`
  });
  await c.write(master.context);
  t.is(c.description, `Category CAT-insert`);
  c.description = "update";
  c.name = "bla";
  await c.write(master.context);

  c = await PostgresCategory.entry(master.context, "bla");

  t.is(c.description, `update`);
  t.is(c.name, `bla`);

  c = await PostgresCategory.entry(master.context, "CAT-12");
  t.is(c.name, `CAT-12`);
  t.is(c.description, undefined);
  await c.delete(master.context);

  await master.close();
});
