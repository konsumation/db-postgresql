import test from "ava";
import { createReadStream } from "node:fs";
import { testRestoreUnsupportedVersion } from "@konsumation/db-test";
import Master from "@konsumation/db-postgresql";
import { createSchema, dropSchema } from "./util.mjs";
import { setSchema } from "../src/util.mjs";

const SCHEMA = "konsum_master_test";

test.before(async t => createSchema(process.env.POSTGRES_URL, SCHEMA));
test.after(async t => dropSchema(process.env.POSTGRES_URL, SCHEMA));

test("testRestoreUnsupportedVersion", async t =>
  testRestoreUnsupportedVersion(
    t,
    Master,
    setSchema(process.env.POSTGRES_URL, SCHEMA)
  ));

test("Master name", t => t.is(Master.name, "postgresql"));

test.serial("initialize", async t => {
  const master = await Master.initialize(
    setSchema(process.env.POSTGRES_URL, SCHEMA)
  );

  t.truthy(master.context);

  const categories = [];

  for await (const c of master.categories(master.context)) {
    categories.push(c);
  }

  t.deepEqual([], categories);

  await master.close();
  t.is(master.context, undefined);
});

test("restore", async t => {
  const master = await Master.initialize(
    setSchema(process.env.POSTGRES_URL, SCHEMA)
  );
  const { category } = await master.fromText(
    createReadStream(
      new URL(
        "../node_modules/@konsumation/db-test/src/fixtures/database-version-3.txt",
        import.meta.url
      ).pathname,
      "utf8"
    )
  );

  t.is(category, 3);
  
  for await (const line of master.text()) {
    console.log(line);
  }

  await master.close();
});
