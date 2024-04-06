import test from "ava";
import { getSchema, setSchema } from "../src/util.mjs";

async function gst(t, url, schema, expected) {
  t.is(getSchema(url, schema), expected);
}

async function sst(t, url, schema, expected) {
  t.is(setSchema(url, schema), expected);
}

gst.title = (providedTitle = "getSchema", url, schema, expected) =>
  `${providedTitle} ${url} ${schema} -> ${expected}`.trim();

sst.title = (providedTitle = "setSchema", url, schema, expected) =>
  `${providedTitle} ${url} ${schema} -> ${expected}`.trim();

test(gst, "postgresql://h/d", undefined, undefined);
test(gst, "postgresql://h/d", "s", "s");
test(gst, "postgresql://h/d?options=-c search_path=public", undefined, "public");
test(gst, "postgresql://h/d?options=-c search_path=public", "s", "s");
test(gst, "postgresql://h/d?currentSchema=s", undefined, "s");
test(gst, "postgresql://h/d?currentSchema=s", "bla", "bla");

test(sst, "postgresql://h/d", undefined, "postgresql://h/d");
test(sst, "postgresql://h/d", "s", "postgresql://h/d?currentSchema=s");
test(sst, "postgresql://h/d?options=-c search_path=public", undefined, "postgresql://h/d");
test(sst, "postgresql://h/d?options=-c search_path=public", "s", "postgresql://h/d?currentSchema=s");
test(sst, "postgresql://h/d?currentSchema=s", undefined, "postgresql://h/d");
test(sst, "postgresql://h/d?currentSchema=s", "bla", "postgresql://h/d?currentSchema=bla");