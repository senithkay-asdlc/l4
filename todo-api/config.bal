import ballerina/os;

// Raw values as injected by the platform. Empty when unset so the service
// still starts and falls back to a sensible default (resolved in db.bal).
configurable string todoDbHost = os:getEnv("TODO_DB_HOST");
configurable string todoDbPort = os:getEnv("TODO_DB_PORT");
configurable string todoDbName = os:getEnv("TODO_DB_DBNAME");
configurable string todoDbUser = os:getEnv("TODO_DB_USER");
configurable string todoDbPassword = os:getEnv("TODO_DB_PASSWORD");
