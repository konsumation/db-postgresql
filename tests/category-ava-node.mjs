import test from "ava";
import { Master, Category } from "@konsumation/db-postgresql";
import { testCategoryConstructor, testCreateCategories } from "@konsumation/db-test";
import { createSchema, dropSchema } from "./util.mjs";

const SCHEMA = "konsum_test_1";

test.before(async t => createSchema(process.env.POSTGRES_URL, SCHEMA));
test.after(async t => dropSchema(process.env.POSTGRES_URL, SCHEMA));

test("Category constructor", t => testCategoryConstructor(t, Category));

test("Category write / read / update / delete", async t => {
  const master = await Master.initialize(process.env.POSTGRES_URL, SCHEMA);

  const categories = await testCreateCategories(
    t,
    master,
    Category,
    Array.from({ length: 10 }, (_, i) => `CAT-${i}`),
    (t, category) => t.true(category.id > 0)
  );

  const cs = [];

  for await (const c of master.categories(master.context)) {
    cs.push(c);
  }

  t.true(cs.length >= categories.length);

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
  t.is(c.description, undefined);
  await c.delete(master.context);

  await master.close();
});
