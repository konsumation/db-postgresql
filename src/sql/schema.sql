CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(80),
    created TIMESTAMP NOT NULL DEFAULT current_timestamp,
    lastmodified TIMESTAMP
);
/* TODO handle \n; in util 
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
*/
CREATE TABLE meter (
    id SERIAL PRIMARY KEY,
    meterserial VARCHAR(100),
    categoryid INT NOT NULL,
    description VARCHAR(80),
    unit VARCHAR(10),
    fractionalDigits INT,
    validfrom DATE,
    lastmodified TIMESTAMP,
    FOREIGN KEY (categoryid) REFERENCES category (id)
);

COMMENT ON COLUMN meter.unit IS 'physical unit like kWh or m3';

COMMENT ON COLUMN meter.fractionaldigits IS 'display precission';

CREATE TABLE
values
    (
        value DECIMAL NOT NULL,
        meter INT NOT NULL REFERENCES meter (id),
        date TIMESTAMP NOT NULL
    );

CREATE TABLE version (
    schemaversion VARCHAR(50) NOT NULL,
    migrated TIMESTAMP NOT NULL DEFAULT current_timestamp
);

insert into
    version (schemaversion)
values
    ('1');