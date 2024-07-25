CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(80),
    unit VARCHAR(10),
    fractional_digits INT NOT NULL DEFAULT 2,
    "order" REAL NOT NULL DEFAULT 1,
    created TIMESTAMP NOT NULL DEFAULT current_timestamp,
    last_modified TIMESTAMP NOT NULL DEFAULT current_timestamp
);

COMMENT ON COLUMN category.unit IS 'physical unit like kWh or m3';

COMMENT ON COLUMN category.fractional_digits IS 'display precission';

CREATE TABLE meter (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    serial VARCHAR(100),
    category_id INT,
    description VARCHAR(80),
    unit VARCHAR(10),
    fractional_digits INT,
    aggregating BOOLEAN DEFAULT true,
    valid_from TIMESTAMP,
    created TIMESTAMP NOT NULL DEFAULT current_timestamp,
    last_modified TIMESTAMP NOT NULL DEFAULT current_timestamp,
    FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE CASCADE
);

COMMENT ON COLUMN meter.unit IS 'physical unit like kWh or m3';

COMMENT ON COLUMN meter.fractional_digits IS 'display precission';

CREATE TABLE
values
    (
        meter_id INT NOT NULL REFERENCES meter (id) ON DELETE CASCADE,
        date TIMESTAMP NOT NULL,
        value REAL NOT NULL,
        PRIMARY KEY(meter_id, date)
    );

CREATE TABLE note (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    meter_id INT NOT NULL REFERENCES meter (id) ON DELETE CASCADE,
    description VARCHAR(80)
);

CREATE TABLE info (
    version VARCHAR(50) NOT NULL,
    description VARCHAR(80),
    created TIMESTAMP NOT NULL DEFAULT current_timestamp
);