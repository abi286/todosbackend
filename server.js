const express = require("express");
const validator = require('validator');
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");
const port = 5001; // This port should be different from the React development server
const jwt = require("jsonwebtoken");

const JWT_SECRET = "bhbhkefkbkfvkbfvk$#@#%@#bbkdcbkkbknvlbkkb";

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/student");

const StudentModel = require("./models/Student");
const Todo = require("./models/Todos");

app.post("/register", async (req, res) => {
  const { name, email, password: plainTextPassword } = req.body;

  // Validate name
  if (!name || typeof name !== "string") {
    return res.json({ status: "error", error: "Invalid name" });
  }

  // Validate email
  if (!validator.isEmail(email)) {
    return res.json({ status: "error", error: "Invalid email" });
  }

  // Validate password
  if (!plainTextPassword || typeof plainTextPassword !== "string") {
    return res.json({ status: "error", error: "Invalid password" });
  }

  if (plainTextPassword.length < 6) {
    return res.json({
      status: "error",
      error: "Password too small. Should be at least 6 characters",
    });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(plainTextPassword, 10);

  try {
    // Create a new student
    const response = await StudentModel.create({
      name,
      email,
      password: hashedPassword,
    });

    // Send a success response
    return res.json({ status: "ok", data: response });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate email error
      return res.json({ status: "error", error: "Email already in use" });
    }
    // Generic error response
    return res.json({ status: "error", error: "An error occurred" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await StudentModel.findOne({ email }).lean();

  if (!user) {
    return res.json({ status: "error", error: "Invalid email/password" });
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (isPasswordValid) {
    // Create a JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expiry time
    );

    return res.json({ status: "ok", data: token });
  } else {
    return res.json({ status: "error", error: "Invalid email/password" });
  }
});

// Get all todos
app.get("/home", async (_req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Add a new todo
app.post("/home", async (req, res) => {
  const newTodo = new Todo({
    task: req.body.task,
  });
  try {
    const savedTodo = await newTodo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

// update todo
app.put("/home/:id", async (req, res) => {
  try {
    const updatedTodo = await Todo.findByIdAndUpdate(req.params.id,{ task: req.body.task, completed: req.body.completed }, { new: true } );
    if (!updatedTodo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(updatedTodo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete a todo by id
app.delete("/home/:id", async (req, res) => {
  try {
    await Todo.deleteOne({ id: req.params.id });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


