/**
 * Convert string chunk sequence into sequence of statements.
 * Also removes comment lines.
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
      yield statement.replaceAll(/\-\-.*\n/g, "");
    }
  }

  if (buffer?.length) {
    buffer = buffer.replaceAll(/\-\-.*\n/g, "");
    if (buffer.length) {
      yield buffer;
    }
  }
}

/**
 * https://stackoverflow.com/questions/22636388/import-sql-file-in-node-js-and-execute-against-postgresql
 * TODO Handling of create functions with multiple rows and ;\n see example in schema.sql 
  TODO handle \n; in util 
CREATE OR REPLACE FUNCTION update_lastmodified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.lastmodified := CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lastmodified_trigger
AFTER UPDATE ON category
FOR EACH ROW
EXECUTE FUNCTION update_lastmodified();

 * Execute DML statements
 * @param {*} client
 * @param {AsyncIterable<string>} chunks
 * @param {object} properties key value pairs to replace
 */
export async function executeStatements(client, chunks, properties) {
  try {
    for await (let statement of chunksToStatements(chunks)) {
      statement = statement.replaceAll(
        /:\(\w+\)|:\w+/g,
        key => properties[key.substring(1)]
      );

      //console.log(`|${statement}|`);
      const result = await client.query(statement);
      //console.log("RESULT", result);
    }
  } catch (e) {
    console.log(e);
    throw "TODO";
  }
}
