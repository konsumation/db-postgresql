
/**
 * Extract schema name from postgres url
 * @param {string} url
 * @param {string} [schema]
 * @returns {string?}
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
  return schema;
}

/**
 * Set schema name to postgres url
 * @param {string} url
 * @param {string} [schema]
 * @returns {string?}
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
