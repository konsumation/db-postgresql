import postgres from "postgres";

export async function createSchema(url, name) {
  try {
    const sql = postgres(url);
    await sql`DROP SCHEMA IF EXISTS ${sql(name)} CASCADE`;
    await sql`CREATE SCHEMA ${sql(name)}`;
    await sql.end();
  } catch (e) {
    console.log(e);
    throw e;
  }
}

export async function dropSchema(url, name) {
  try {
    const sql = postgres(url);
    await sql`DROP SCHEMA IF EXISTS ${sql(name)} CASCADE`;
    await sql.end();
  } catch (e) {
    console.log(e);
    throw e;
  }
}
