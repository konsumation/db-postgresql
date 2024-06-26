/**
 * Extract schema name from postgres url
 * @param {string} url
 * @param {string} [schema]
 * @returns {Object}
 */
export function getSchema(url, schema) {
  if (!schema) {
    const u = new URL(url);
    if (u.searchParams.has("currentSchema")) {
      schema = u.searchParams.get("currentSchema");
    } else if (u.searchParams.has("options")) {
      const m = u.searchParams.get("options")?.match(/search_path=(\w+)/);
      if (m) {
        schema = m[1];
      }
    }
  }
  url = url.replace(/\?.*$/, "");
  return { url, schema };
}

/**
 * Set schema name to postgres url
 * @param {string} url
 * @param {string} [schema]
 * @returns {string}
 */
export function setSchema(url, schema) {
  //do we need any other options on url, if yes replace need to be modified like on getSchema
  url = url.replace(/\?.*$/, "");
  if (schema) {
    return `${url}?currentSchema=${schema}`;
  } else {
    return url;
  }
}

/**
 * Set schema name to postgres url
 * @param {string} url
 * @param {string} [database]
 * @returns {string}
 */
export function setDatabase(url, database) {
  if (database) {
    const m = url.match(/(?<a>^.*\/)(?<e>\w+)(?<r>\?.*)?$/);
    return `${m.groups.a}${database}${m.groups.r || ""}`;
  }
  return url;
}
