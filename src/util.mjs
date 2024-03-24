import pg from "pg";
import { execaCommand } from "execa";

/**
 * prepare extra database with given name and install schema into it
 * is needed to make possible run tests in parallel
 * @param {string} name 
 * @param {boolean} true install schema 

 */
export async function prepareDBSchemaFor(name, withInstall = true) {
  if (withInstall) {
    const RECRATESQL = new URL("sql/recreateDB.sql", import.meta.url).pathname;
    await execaCommand(
      `psql -h ${process.env.POSTGRES_HOST} -U ${process.env.POSTGRES_USER} -a -f ${RECRATESQL} -v ON_ERROR_STOP=1 -v name=${name}`
    );
  }

  const db = new pg.Pool({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER,
    //password: process.env.POSTGRES_PASSWORD, --> alternative PGPASSWORD
    database: name,
    allowExitOnIdle: true
  });

  if (!withInstall) {
    return db;
  }

  const DEPLOYSQL = new URL("sql/schema.sql", import.meta.url).pathname;

  await execaCommand(
    `psql -h ${process.env.POSTGRES_HOST} -U ${process.env.POSTGRES_USER} -d ${name} -a -f ${DEPLOYSQL} -v ON_ERROR_STOP=1 -v version=1.0.0`
  );

  return db;
}

/**
 * Convert string chunk sequence into sequence of statements.
 * @param {AsyncIterable<string>} chunks
 * @return {AsyncIterable<string>}
 */
export async function* chunksToStatements(chunks) {
  let buffer = "";
  for await (const chunk of chunks) {
    buffer += chunk;

    const statements = buffer.split(/;\n/);
    buffer = statements.pop();

    for (const statement of statements) {
      yield statement;
    }
  }

  if (buffer?.length) {
    yield buffer;
  }
}

/**
 * Execute DML statements
 * @param {*} client
 * @param {AsyncIterable<string>} chunks 
 * @param {object} properties key value pairs to replace
 */
export async function executeStatements(client, chunks, properties) {
  try {
    await client.connect();

    for await (let statement of chunksToStatements(chunks)) {
      statement = statement.replaceAll(/:\(\w+\)/g, key => properties[key]);

      console.log(statement);
      const result = await client.query(statement);
      console.log("RESULT", result.rows);
    }

  } catch (e) {
    console.log(e);
  }
  finally {
    await client.end();
  }
}
