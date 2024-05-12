import test from "ava";
import { PostgresMaster, PostgresCategory } from "@konsumation/db-postgresql";
import {
  testCategoryConstructor,
  testWriteReadUpdateDeleteCategories
} from "@konsumation/db-test";
import { createSchema, dropSchema } from "./util.mjs";
import { setSchema } from "../src/util.mjs";

const SCHEMA = "test-konsum-category";

test.before(async t => createSchema(process.env.POSTGRES_URL, SCHEMA));
test.after.always(async t => dropSchema(process.env.POSTGRES_URL, SCHEMA));

test("Category constructor", t =>
  testCategoryConstructor(t, PostgresCategory, { fractionalDigits: 3 }));

test.serial("Category write / read / update / delete", async t =>
  testWriteReadUpdateDeleteCategories(
    t,
    await PostgresMaster.initialize(setSchema(process.env.POSTGRES_URL, SCHEMA))
  ));

test.serial("Category write same name", async t => {
  const master = await PostgresMaster.initialize(
    setSchema(process.env.POSTGRES_URL, SCHEMA)
  );
  const context = master.context;

  const cat1a = master.addCategory(context, { name: "CAT1" });
  const cat1b = master.addCategory(context, { name: "CAT1" });

  await cat1a.write(context);
  await cat1b.write(context);

  t.is(cat1a.id, cat1b.id);
  //t.deepEqual(cat1a, cat1b);

  await master.close();
});
