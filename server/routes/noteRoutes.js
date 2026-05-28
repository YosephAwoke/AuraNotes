const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');

// Apply authentication guard to all routes
router.use(protect);

// @route   GET /api/notes
// @desc    Get all notes for logged in user (with search and pin filters)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let query = { user: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    let apiQuery = Note.find(query);

    // Sorting options: default newest first
    if (sort === 'oldest') {
      apiQuery = apiQuery.sort({ createdAt: 1 });
    } else if (sort === 'alphabetical') {
      apiQuery = apiQuery.sort({ title: 1 });
    } else {
      apiQuery = apiQuery.sort({ isPinned: -1, updatedAt: -1 }); // Default: pinned first, then recently updated
    }

    const notes = await apiQuery;
    res.json(notes);
  } catch (error) {
    console.error('Fetch notes error:', error.message);
    res.status(500).json({ message: 'Server error fetching notes' });
  }
});

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, content, category, color, isPinned } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Note title is required' });
    }

    const newNote = new Note({
      user: req.user._id,
      title,
      content: content || '',
      category: category || 'General',
      color: color || '#3b82f6',
      isPinned: isPinned || false,
      version: 1,
      history: [],
    });

    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error('Create note error:', error.message);
    res.status(500).json({ message: 'Server error creating note' });
  }
});

// @route   GET /api/notes/:id
// @desc    Get a single note
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Fetch single note error:', error.message);
    res.status(500).json({ message: 'Server error fetching note' });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note (and snapshot version history if content changes)
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { title, content, category, color, isPinned } = req.body;
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check if the title or content is changing. If yes, save a version history snapshot of the CURRENT state
    const isTitleChanged = title !== undefined && title !== note.title;
    const isContentChanged = content !== undefined && content !== note.content;

    if (isTitleChanged || isContentChanged) {
      // Add current state to history
      note.history.push({
        version: note.version,
        title: note.title,
        content: note.content,
      });

      // Increment version number
      note.version += 1;
    }

    // Apply updates
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (category !== undefined) note.category = category;
    if (color !== undefined) note.color = color;
    if (isPinned !== undefined) note.isPinned = isPinned;

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    console.error('Update note error:', error.message);
    res.status(500).json({ message: 'Server error updating note' });
  }
});

// @route   PUT /api/notes/:id/revert/:historyId
// @desc    Revert a note to a specific history version
// @access  Private
router.put('/:id/revert/:historyId', async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Find the history snapshot
    const historyItem = note.history.id(req.params.historyId);
    if (!historyItem) {
      return res.status(404).json({ message: 'Version snapshot not found' });
    }

    // Save current state to history before reverting
    note.history.push({
      version: note.version,
      title: note.title,
      content: note.content,
    });

    // Revert to history values and increment version
    note.title = historyItem.title;
    note.content = historyItem.content;
    note.version += 1;

    // Optional: remove the snapshot we just reverted to or keep it in history. We keep it to preserve absolute undo timeline.
    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    console.error('Revert note error:', error.message);
    res.status(500).json({ message: 'Server error reverting note' });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const result = await Note.deleteOne({ _id: req.params.id, user: req.user._id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    res.json({ message: 'Note removed successfully' });
  } catch (error) {
    console.error('Delete note error:', error.message);
    res.status(500).json({ message: 'Server error deleting note' });
  }
});

module.exports = router;
