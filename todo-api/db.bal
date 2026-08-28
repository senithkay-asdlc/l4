import ballerina/sql;
import ballerina/time;
import ballerina/uuid;
import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;

// Sensible defaults so the service still starts when the platform-injected
// env vars are unset.
final string dbHost = todoDbHost != "" ? todoDbHost : "localhost";
final int dbPort = resolvePort(todoDbPort, 5432);
final string dbName = todoDbName != "" ? todoDbName : "todos";
final string dbUser = todoDbUser != "" ? todoDbUser : "postgres";
final string dbPassword = todoDbPassword != "" ? todoDbPassword : "postgres";

final postgresql:Client dbClient = check new (host = dbHost, port = dbPort, database = dbName, username = dbUser, password = dbPassword);

type TodoRow record {|
    string id;
    string text;
    boolean completed;
    time:Utc createdAt;
|};

function resolvePort(string value, int defaultValue) returns int {
    if value == "" {
        return defaultValue;
    }
    int|error parsed = int:fromString(value);
    if parsed is int {
        return parsed;
    }
    return defaultValue;
}

function init() returns error? {
    _ = check dbClient->execute(`
        CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            text TEXT NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL
        )
    `);
}

function toTodo(TodoRow row) returns Todo => {
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: time:utcToString(row.createdAt)
};

function insertTodo(string userId, string text) returns Todo|error {
    string id = uuid:createType1AsString();
    time:Utc createdAt = time:utcNow();
    sql:ParameterizedQuery query = `
        INSERT INTO todos (id, user_id, text, completed, created_at)
        VALUES (${id}, ${userId}, ${text}, FALSE, ${createdAt})
    `;
    _ = check dbClient->execute(query);
    return {id: id, text: text, completed: false, createdAt: time:utcToString(createdAt)};
}

function listTodosForUser(string userId, int 'limit, int offset, boolean? completed) returns [Todo[], int]|error {
    sql:ParameterizedQuery countQuery = `SELECT COUNT(*) AS count FROM todos WHERE user_id = ${userId}`;
    sql:ParameterizedQuery dataQuery = `SELECT id, text, completed, created_at AS createdAt FROM todos WHERE user_id = ${userId}`;

    if completed is boolean {
        countQuery = sql:queryConcat(countQuery, ` AND completed = ${completed}`);
        dataQuery = sql:queryConcat(dataQuery, ` AND completed = ${completed}`);
    }
    dataQuery = sql:queryConcat(dataQuery, ` ORDER BY created_at ASC LIMIT ${'limit} OFFSET ${offset}`);

    record {| int count; |} countRow = check dbClient->queryRow(countQuery);

    stream<TodoRow, sql:Error?> rowStream = dbClient->query(dataQuery);
    Todo[] todos = [];
    check from TodoRow row in rowStream
        do {
            todos.push(toTodo(row));
        };
    check rowStream.close();

    return [todos, countRow.count];
}

function completeTodoForUser(string userId, string todoId) returns Todo|error? {
    sql:ParameterizedQuery updateQuery = `UPDATE todos SET completed = TRUE WHERE id = ${todoId} AND user_id = ${userId}`;
    sql:ExecutionResult result = check dbClient->execute(updateQuery);
    int? affectedRowCount = result.affectedRowCount;
    if affectedRowCount is int && affectedRowCount > 0 {
        TodoRow row = check dbClient->queryRow(`
            SELECT id, text, completed, created_at AS createdAt FROM todos
            WHERE id = ${todoId} AND user_id = ${userId}
        `);
        return toTodo(row);
    }
    return ();
}
