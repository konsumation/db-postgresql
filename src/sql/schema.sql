CREATE TABLE category (
    id SERIAL,
    name VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(80),
    created TIMESTAMP NOT NULL DEFAULT current_timestamp
);

ALTER TABLE
    category
ADD
    CONSTRAINT category_pk PRIMARY KEY (id, name);

CREATE TABLE meter (
    id SERIAL PRIMARY KEY,
    meterserial VARCHAR(100),
    categoryid INT NOT NULL,
    categoryname VARCHAR(30) NOT NULL,
    description VARCHAR(80),
    unit VARCHAR(10),
    fractionalDigits INT,
    validfrom DATE,
    FOREIGN KEY (categoryid, categoryname) REFERENCES category (id, name)
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
    (:'version') RETURNING *;
