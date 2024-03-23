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

RECRATESQL="src/sql/recreateDB.sql"

if [ ! -r "${RECRATESQL}" ]; then
    echo "${RECRATESQL} does not exist or not readable"
    exit 1
fi

psql -h $POSTGRES_HOST -U $POSTGRES_USER -a -f $RECRATESQL -v name=$POSTGRES_DB
