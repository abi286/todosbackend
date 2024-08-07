const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


const TodoSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4 },
  task: { type: String, required: true },
  completed: { type: Boolean, default: false },
  isEditing: { type: Boolean, default: false },
});


const Todo = mongoose.model('Todo', TodoSchema);
module.exports = Todo;
