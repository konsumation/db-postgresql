CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(80),
    created TIMESTAMP NOT NULL DEFAULT current_timestamp
);

CREATE TABLE meter (
    id SERIAL PRIMARY KEY,
    meterserial VARCHAR(100),
    category INT NOT NULL,
    description VARCHAR(80),
    unit VARCHAR(10),
    fractionalDigits INT,
    validfrom DATE,
    FOREIGN KEY (category) REFERENCES category (id)
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
    appversion VARCHAR(50) NOT NULL,
    migrated TIMESTAMP NOT NULL DEFAULT current_timestamp
);

insert into
    version (appversion)
values
    ('1');