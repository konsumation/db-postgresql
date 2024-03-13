create table category (
    id SERIAL, name VARCHAR(30) not null PRIMARY KEY, description VARCHAR(80)
);

COMMENT ON COLUMN category.unit IS 'physical unit like kWh or m3';

COMMENT ON COLUMN category.fractionaldigits IS 'display precission';

-- FOREIGN key on category name and id columns instead of two different
CREATE TABLE meter (
    id SERIAL, meterserial varchar(100), categoryid int not null REFERENCES category(id), category VARCHAR(30) not null REFERENCES category(name), description VARCHAR(80), unit VARCHAR(10), fractionalDigits INT
);

COMMENT ON COLUMN meter.unit IS 'physical unit like kWh or m3';

COMMENT ON COLUMN meter.fractionaldigits IS 'display precission';

create table values (
    value decimal not null,
    meter int not NULL references meter(id),
    date timestamp not null
);
