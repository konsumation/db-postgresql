import test from "ava";
import { getSchema } from "../src/util.mjs";

async function gst(t, url, schema, expected) {
  t.is(getSchema(url, schema), expected);
}

gst.title = (providedTitle = "getSchema", url, schema, expected) =>
  `${providedTitle} ${url} ${schema} -> ${expected}`.trim();

test(gst, "postgresql://h/d", undefined, undefined);
test(gst, "postgresql://h/d", "s", "s");
test(gst, "postgresql://h/d?options=-c search_path=public", undefined, "public");
test(gst, "postgresql://h/d?options=-c search_path=public", "s", "s");
test.failing(gst, "postgresql://h/d?currentSchema=s", undefined, "s");
