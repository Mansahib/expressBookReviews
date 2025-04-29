const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// User registration
regd_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (isValid(username)) {
    return res.status(400).json({message: "Username already exists"});
  }

  users.push({username, password});
  return res.status(200).json({message: "User successfully registered"});
});

// User login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).json({message: "User successfully logged in"});
  } else {
    return res.status(401).json({message: "Invalid username or password"});
  }
});

// Add/update book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({message: "Review added/updated successfully"});
});

// Delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn] || !books[isbn].reviews[username]) {
    return res.status(404).json({message: "Review not found"});
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({message: "Review deleted successfully"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;