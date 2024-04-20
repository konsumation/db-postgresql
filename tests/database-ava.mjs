import test from "ava";
import { /*getDatabase,*/ setDatabase } from "../src/util.mjs";
/*
async function gdt(t, url, schema, expected) {
  t.deepEqual(getDatabase(url, schema), expected);
}
*/
async function sdt(t, url, schema, expected) {
  t.is(setDatabase(url, schema), expected);
}
/*
gdt.title = (providedTitle = "getDatabase", url, schema, expected) =>
  `${providedTitle} ${url} ${schema} -> ${expected}`.trim();
*/
sdt.title = (providedTitle = "setDatabase", url, schema, expected) =>
  `${providedTitle} ${url} ${schema} -> ${expected}`.trim();
/*
test(gdt, "postgresql://h/d", undefined, {
  schema: undefined,
  url: 'postgresql://h/d',
});
test(gdt, "postgresql://h/d", "s", {
  schema: "s",
  url: 'postgresql://h/d',
});
test(gdt, "postgresql://h/d?options=-c search_path=public", undefined, {
  schema: "public",
  url: 'postgresql://h/d',
});
test(gdt, "postgresql://h/d?options=-c search_path=public", "s", {
  schema: "s",
  url: 'postgresql://h/d',
});
test(gdt, "postgresql://h/d?currentSchema=s", undefined, {
  schema: "s",
  url: 'postgresql://h/d',
});
test(gdt, "postgresql://h/d?currentSchema=s", "bla", {
  schema: "bla",
  url: 'postgresql://h/d',
});
*/
test(sdt, "postgresql://h/d", undefined, "postgresql://h/d");
test(sdt, "postgresql://h/d", "dn", "postgresql://h/dn");
test(sdt, "postgresql://h/d?options=-c search_path=public", undefined, "postgresql://h/d?options=-c search_path=public");
test(sdt, "postgresql://h/d?options=-c search_path=public", "dn", "postgresql://h/dn?options=-c search_path=public");
test(sdt, "postgresql://h/d?currentSchema=s", undefined, "postgresql://h/d?currentSchema=s");
test(sdt, "postgresql://h/d?currentSchema=s", "bla", "postgresql://h/bla?currentSchema=s");