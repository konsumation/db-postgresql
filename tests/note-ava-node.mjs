import test from "ava";
import { Note } from "@konsumation/konsum-db-postgresql";
import { testNoteConstructor } from "@konsumation/db-test";

test("Note constructor", t => testNoteConstructor(t, Note, { /*categoryid: 1*/ }));
