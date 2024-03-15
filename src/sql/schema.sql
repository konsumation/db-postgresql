create table category (
    id SERIAL, name VARCHAR(30) not null, description VARCHAR(80)
);

ALTER TABLE category
ADD CONSTRAINT category_pk PRIMARY KEY (id, name);
-- FOREIGN key on category name and id columns instead of two different
CREATE TABLE meter (
    id SERIAL PRIMARY KEY, meterserial varchar(100), categoryid int not null, category VARCHAR(30) not null, description VARCHAR(80), unit VARCHAR(10), fractionalDigits INT, Foreign Key (categoryid, category) REFERENCES category (id, name)
);

COMMENT ON COLUMN meter.unit IS 'physical unit like kWh or m3';

COMMENT ON COLUMN meter.fractionaldigits IS 'display precission';

CREATE TABLE
values
    (
        value decimal not null,
        meter int not NULL REFERENCES meter(id),
        date timestamp not null
    );