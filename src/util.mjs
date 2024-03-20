import pg from "pg";
import { execaCommand } from "execa";

/**
 * prepare extra database with given name and install schema into it
 * is needed to make possible run tests in parallel
 * @param {string} name 
 */
export async function prepareDBSchemaFor(name) {
    let db = new pg.Pool({
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      user: process.env.POSTGRES_USER,
      //password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    });
  
    await db.query(`drop database if exists ${name}`);
    await db.query(`create database ${name}`);
    await db.end();
  
    db = new pg.Pool({
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      user: process.env.POSTGRES_USER,
      //password: process.env.POSTGRES_PASSWORD,
      database: name,
    });
  
    const DEPLOYSQL = new URL("sql/schema.sql", import.meta.url).pathname
  
    await execaCommand(`psql -h ${process.env.POSTGRES_HOST} -U ${process.env.POSTGRES_USER} -d master -a -f ${DEPLOYSQL} -v ON_ERROR_STOP=1 -v version=1.0.0`)
  
    return db
  }