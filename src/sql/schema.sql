create table category (
    id SERIAL, name VARCHAR(30) not null PRIMARY KEY, description VARCHAR(80), unit VARCHAR(10), fractionalDigits INT
);

COMMENT ON COLUMN category.unit IS 'physical unit like kWh or m3';

COMMENT ON COLUMN category.fractionaldigits IS 'display precission';

CREATE TABLE meter (
    id SERIAL, name VARCHAR(30) not null PRIMARY KEY, category VARCHAR(30) not null, description VARCHAR(80), unit VARCHAR(10), fractionalDigits INT
);

COMMENT ON COLUMN meter.unit IS 'physical unit like kWh or m3';

COMMENT ON COLUMN meter.fractionaldigits IS 'display precission';

create table values (
    value decimal not null,
    category VARCHAR(30) not NULL references category(name),
    date timestamp not null
);
