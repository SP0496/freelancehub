#!/usr/bin/env bash

(
    set -euo pipefail

    : "${MARKETPLACE_DB_PASSWORD:?Set MARKETPLACE_DB_PASSWORD}"
    : "${MYSQL_ROOT_PASSWORD:?Set MYSQL_ROOT_PASSWORD}"

    # Encode the password so special characters are handled safely.
    password_hex=$(
        printf '%s' "$MARKETPLACE_DB_PASSWORD" |
        od -An -v -tx1 |
        tr -d ' \n'
    )

    MYSQL_PWD="$MYSQL_ROOT_PASSWORD" \
    mysql --protocol=socket --user=root \
        --default-character-set=utf8mb4 <<SQL
SET SESSION sql_mode = '';

CREATE DATABASE IF NOT EXISTS fh_marketplace
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

SET @marketplace_password =
    CONVERT(0x${password_hex} USING utf8mb4);

SET @create_user = CONCAT(
    'CREATE USER IF NOT EXISTS ''fh_marketplace_app''@''%'' IDENTIFIED BY ',
    QUOTE(@marketplace_password)
);

PREPARE create_marketplace_user FROM @create_user;
EXECUTE create_marketplace_user;
DEALLOCATE PREPARE create_marketplace_user;

GRANT ALL PRIVILEGES ON fh_marketplace.*
    TO 'fh_marketplace_app'@'%';
SQL
)