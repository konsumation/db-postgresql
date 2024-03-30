import test from "ava";
import { createReadStream } from "node:fs";

import { Master } from "@konsumation/konsum-db-postgresql";
import { createSchema, dropSchema } from "./util.mjs";

const SCHEMA = "konsum_master_test";

test.before(async t => createSchema(process.env.POSTGRES_URL, SCHEMA));
test.after(async t => dropSchema(process.env.POSTGRES_URL, SCHEMA));

test.serial("initialize", async t => {
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

test.serial("restore", async t => {
  const master = await Master.initialize(process.env.POSTGRES_URL, SCHEMA);
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

  for await (const line of master.text(master.context)) {
    console.log(line);
  }

  await master.close();
});
