#!/bin/bash

check_vars()
{
    var_names=("$@")
    for var_name in "${var_names[@]}"; do
        [ -z "${!var_name}" ] && echo "$var_name is unset." && var_unset=true
    done
    [ -n "$var_unset" ] && exit 1
    return 0
}

check_vars POSTGRES_PORT POSTGRES_HOST POSTGRES_USER PGPASSWORD POSTGRES_DB

DEPLOYSQL="src/sql/schema.sql"

if [ ! -r "${DEPLOYSQL}" ]; then
    echo "${DEPLOYSQL} does not exist or not readable"
    exit 1
fi

psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -a -f $DEPLOYSQL -v ON_ERROR_STOP=1
