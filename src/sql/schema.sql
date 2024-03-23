CREATE TABLE category (
    id SERIAL,
    name VARCHAR(30) not null UNIQUE,
    description VARCHAR(80),
    created timestamp not null default current_timestamp
);

ALTER TABLE
    category
ADD
    CONSTRAINT category_pk PRIMARY KEY (id, name);

CREATE TABLE meter (
    id SERIAL PRIMARY KEY,
    meterserial varchar(100),
    categoryid int not null,
    categoryname VARCHAR(30) not null,
    description VARCHAR(80),
    unit VARCHAR(10),
    fractionalDigits INT,
    validfrom date,
    Foreign Key (categoryid, categoryname) REFERENCES category (id, name)
);

COMMENT ON COLUMN meter.unit IS 'physical unit like kWh or m3';

COMMENT ON COLUMN meter.fractionaldigits IS 'display precission';

CREATE TABLE
values
    (
        value decimal not null,
        meter int not NULL REFERENCES meter (id),
        date timestamp not null
    );

CREATE TABLE version (
    appversion varchar(50) not null,
    migrated timestamp not null default current_timestamp
);

insert into
    version (appversion)
values
    (:'version') RETURNING *;

commit;