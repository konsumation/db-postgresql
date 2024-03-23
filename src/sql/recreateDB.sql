--https://phoenixnap.com/kb/postgresql-drop-database
drop database if EXISTS :name WITH (FORCE);
create database :name;