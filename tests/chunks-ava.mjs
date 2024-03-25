import test from "ava";
import { chunksToStatements } from "../src/util.mjs";

async function cost(t, input, expected) {
  async function* ai(source) {
    for (const s of source) {
      yield s;
    }
  }

  const statements = [];

  for await (const s of chunksToStatements(ai(input))) {
    statements.push(s);
  }

  t.deepEqual(statements, expected);
}

cost.title = (providedTitle = "chunksToStatements", input, expected) =>
  `${providedTitle} ${input} ${expected}`.trim();

test(cost, ["a"], ["a"]);
test(cost, ["-- a comment\n"], []);
test(cost, ["-- a comment\n","a;\n","-- b comment\n"], ["a"]);
test(cost, ["a;\n"], ["a"]);
test(cost, ["a;\nb"], ["a", "b"]);
test(cost, ["a\naa;\nb"], ["a\naa", "b"]);
test(cost, ["a;\n", "b\nc", ";\n"], ["a", "b\nc"]);
