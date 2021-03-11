const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user  = users.find(
    (user) => user.username === username
  );

  if(!user) {
    return response.status(404).json({ error: "User not found!"});
  }

  request.user = user;

  return next();
}

// Checar se existe determinada tareda pelo seu Id. Passadas por Route Params.
function checksExistsTaskById(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const task = user.todos.find(
    (element) => element.id === id
  );

  if(!task){
    return response.status(404).json({ error: "Task not found!" });
  }

  request.task = task;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username // === - Vai comparar o tipo e se os valores são iguais.
    );

  if(userAlreadyExists) {
    return response.status(400).json({ error : "User already exists!" });
  }

  user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;


  const task = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  user.todos.push(task);
  
  return response.status(201).json(task);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTaskById, (request, response) => {
  const { title, deadline } = request.body;
  const { task } = request;

  task.title = title;
  task.deadline = new Date(deadline);

  return response.json(task);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTaskById, (request, response) => {
  const { task } = request;

  task.done = true;
  
  return response.json(task);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTaskById, (request, response) => {
  const { user, task } = request;

  // Recolhendo o index com findIndex() para ser utilizado no slice()
  const index = user.todos.indexOf(task);

  // Removedo a conta. slice(startIndex: qtdItems).
  user.todos.splice(index, 1);

  return response.status(204).send();
});

module.exports = app;