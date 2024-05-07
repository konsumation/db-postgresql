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

test("Category write / read / update / delete", async t =>
  testWriteReadUpdateDeleteCategories(
    t,
    await PostgresMaster.initialize(setSchema(process.env.POSTGRES_URL, SCHEMA))
  ));
