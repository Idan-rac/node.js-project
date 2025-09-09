-- קובץ אתחול אופציונלי ל-Postgres (יופעל אוטומטית אם תחבר אותו ל- /docker-entrypoint-initdb.d/)
CREATE USER idanr WITH PASSWORD '12345';
CREATE DATABASE db OWNER idanr;
GRANT ALL PRIVILEGES ON DATABASE appdb TO appuser;
