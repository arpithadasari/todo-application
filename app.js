const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const priorityAndStatusProperty = (requestQuery) =>{
    return (requestQuery.priority !== undefined && requestQuery.status !== undefined);
};

const priorityProperty = (requestQuery) => {
    return (requestQuery.priority !== undefined);
};

const statusProperty = (requestQuery) => {
    return (requestQuery.status !== undefined);
};

app.get("/todos/", async (request, response) => {
    let data = null;
    let getTodoQuery = "";
    const { search_q = "",priority,status } = request.query;
    switch (true) {
        case priorityAndStatusProperty(request.query);
            getTodoQuery = `
        SELECT
            *
        FROM 
           todo 
        WHERE 
            todo LIKE '%${search_q}%'
            AND status = '${status}'
            AND priority = '${priority}'
            ;`;
            break;
        case priorityProperty(request.query);
        const getTodoQuery = `
        SELECT
            *
        FROM 
           todo 
        WHERE 
            todo LIKE '%${search_q}%'
            AND priority ='${priority}';`;
            break;
        case statusProperty(request.query);
        const getTodoQuery = `
        SELECT
            *
        FROM 
           todo 
        WHERE 
            todo LIKE '%${search_q}%'
            AND status ='${status}';`;
            break;
        default: 
        const getTodoQuery = `
        SELECT
            *
        FROM 
           todo 
        WHERE 
            todo LIKE '%${search_q}%';`;
            break;
    }
        const data = await database.all(getTodoQuery);
        response.send(data);
});


app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT 
      * 
    FROM 
      todo
    WHERE 
      id = ${todoId};`;
  const todo = await database.get(getTodoQuery);
  response.send(todo);
});


app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodoQuery = `
    INSERT INTO
        todo(id,todo,priority,status)
    VALUES
        (
            ${id},
            '${todo}',
            '${priority}',
            '${status}'
        );`;
  await database.run(addTodoQuery);

  response.send("Todo Successfully Added");
});


app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestDetails = request.body;
  switch (true) {
        case requestDetails.status !== undefined;
          updateColumn = "Status";
          break;
        case requestDetails.priority !== undefined;
          updateColumn = "Priority";
          break;
        case requestDetails.todo !== undefined;
          updateColumn = "Todo";
          break;
  }
  const previousTodoQuery = `
    SELECT 
        *
    FROM 
        todo
    WHERE
        id = ${todoID};`;
  const previousTodo = await database.get(previousTodoQuery);
  
  const{
      todo = previousTodo.todo,
      priority = previousTodo.priority,
      status = previousTodo.status,
  } = request.body;
  const updateTodoQuery = `
    UPDATE 
        todo
    SET 
        todo = '${todo}',
        priority = '${priority}', 
        status = '${status}' 
    WHERE
        id = ${todoId};`;

await database.run(updateTodoQuery);
response.send(`${updateColumn} Updated`);
});

//DELETE API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE
      
    FROM
      todo
    WHERE 
      id = ${todoId};`;
  await database.get(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
