-- "Ghostbuster" Script: Wipes all Legacy V1 tables
-- These tables are causing the Foreign Key errors but are NOT used by the new V2 app.

-- 1. Delete all records from child tables first
DELETE FROM register;
DELETE FROM verifylocation;
DELETE FROM setlocation;

-- 2. Now safe to delete from the parent table
DELETE FROM team_no;

-- (Your V2 data in 'teams' and 'scans' is safe and won't be touched)
