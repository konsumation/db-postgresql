CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(80),
    created TIMESTAMP NOT NULL DEFAULT current_timestamp,
    lastmodified TIMESTAMP
);

CREATE TABLE meter (
    id SERIAL PRIMARY KEY,
    serial VARCHAR(100) NOT NULL,
    category_id INT,
    description VARCHAR(80),
    unit VARCHAR(10),
    fractional_digits INT,
    valid_from TIMESTAMP,
    lastmodified TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES category (id)
);

COMMENT ON COLUMN meter.unit IS 'physical unit like kWh or m3';

COMMENT ON COLUMN meter.fractional_digits IS 'display precission';

CREATE TABLE
values
    (
        value DECIMAL NOT NULL,
        meter_id INT NOT NULL REFERENCES meter (id),
        date TIMESTAMP NOT NULL
    );

CREATE TABLE note (
    date TIMESTAMP NOT NULL DEFAULT current_timestamp,
    meter_id INT NOT NULL REFERENCES meter (id),
    description VARCHAR(80),
    PRIMARY KEY (date, meter_id)
);

CREATE TABLE version (
    schema_version VARCHAR(50) NOT NULL,
    migrated TIMESTAMP NOT NULL UNIQUE DEFAULT current_timestamp
);