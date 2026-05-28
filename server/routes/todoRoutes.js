const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const { protect } = require('../middleware/auth');

// Apply protection to all todo endpoints
router.use(protect);

// @route   GET /api/todos
// @desc    Get all todos for logged in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    console.error('Fetch todos error:', error.message);
    res.status(500).json({ message: 'Server error fetching todos' });
  }
});

// @route   POST /api/todos
// @desc    Create a new todo
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { text, priority, dueDate } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Todo text is required' });
    }

    const todo = await Todo.create({
      user: req.user._id,
      text,
      priority: priority || 'medium',
      dueDate,
    });

    res.status(201).json(todo);
  } catch (error) {
    console.error('Create todo error:', error.message);
    res.status(500).json({ message: 'Server error creating todo' });
  }
});

// @route   PUT /api/todos/:id
// @desc    Update a todo (text, priority, or toggling completion status)
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { text, isCompleted, priority, dueDate } = req.body;
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user._id });

    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (text !== undefined) todo.text = text;
    if (isCompleted !== undefined) todo.isCompleted = isCompleted;
    if (priority !== undefined) todo.priority = priority;
    if (dueDate !== undefined) todo.dueDate = dueDate;

    const updatedTodo = await todo.save();
    res.json(updatedTodo);
  } catch (error) {
    console.error('Update todo error:', error.message);
    res.status(500).json({ message: 'Server error updating todo' });
  }
});

// @route   DELETE /api/todos/:id
// @desc    Delete a todo
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const result = await Todo.deleteOne({ _id: req.params.id, user: req.user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Todo not found or unauthorized' });
    }

    res.json({ message: 'Todo removed successfully' });
  } catch (error) {
    console.error('Delete todo error:', error.message);
    res.status(500).json({ message: 'Server error deleting todo' });
  }
});

module.exports = router;
