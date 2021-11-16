const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { request, response } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);
  if (!user) {
    return response.status(400).json({error: "User not found"})
  }
  request.user = user;
  return next();
 }

 function checksExistTodo(user, id){
  const idAlreadyExist = user.todos.some(
    (todo) => todo.id === id
  );
  if (!idAlreadyExist) {
    return response.status(404).json({error: "ID not found"});
  }
  const todo = user.todos.find( todo => todo.id === id );  
  return todo;
 }

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExist = users.some(
    (user) => user.username === username
  );
  if (userAlreadyExist) {
    return response.status(400).json({error: "User already exist!"})
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user);
  return response.status(201).json(user);
});

app.get("/users_list", (request, response) => {
  return response.json(users);
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;  
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;  
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;  
    

  const idAlreadyExist = user.todos.some(
    (todo) => todo.id === id
  );
  if (!idAlreadyExist) {
    return response.status(404).json({error: "ID not found"});
  }

  const todo = checksExistTodo(user, id);
  todo.title = title;
  todo.deadline = deadline;  
  return response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const idAlreadyExist = user.todos.some(
    (todo) => todo.id === id
  );
  if (!idAlreadyExist) {
    return response.status(404).json({error: "ID not found"});
  }
  const todo = checksExistTodo(user, id);
  todo.done = true;
  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const idAlreadyExist = user.todos.some(
    (todo) => todo.id === id
  );
  if (!idAlreadyExist) {
    return response.status(404).json({error: "Todo ID not found"});
  }
  const todoIndex = user.todos.findIndex((todo) => todo.id === id);
  const removedTodo = user.todos.splice(todoIndex, 1);  
  return response.status(204).json(removedTodo);
});

module.exports = app;