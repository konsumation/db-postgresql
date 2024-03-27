import test from "ava";
import { Meter } from "@konsumation/konsum-db-postgresql";
import { testMeterConstructor } from "@konsumation/db-test";


test("Meter constructor", t => testMeterConstructor(t, Meter, { /*categoryid: 1*/ }));
