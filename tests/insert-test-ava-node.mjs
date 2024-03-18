import pg from "pg";
import test from "ava";

const pgclient = new pg.Client({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  //password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

await pgclient.connect();

const text =
  "INSERT INTO category(name, description) VALUES($1, $2) RETURNING *";
const values = ["Strom", "Strom Kategorie"];

pgclient.query(text, values, (err, res) => {
  if (err) throw err;
});

const answer = await pgclient.query("SELECT * FROM category");
await pgclient.end();
test("Add Category", async (t) => {
  t.is(answer.rows[0].name, "Strom");
});
