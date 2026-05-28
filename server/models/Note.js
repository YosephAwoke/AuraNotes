const mongoose = require('mongoose');

const noteHistorySchema = new mongoose.Schema(
  {
    version: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'updatedAt', updatedAt: false }, // Only record when snapshot was saved
  }
);

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    color: {
      type: String,
      default: '#3b82f6', // Tailwind blue by default
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    version: {
      type: Number,
      default: 1,
    },
    history: [noteHistorySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Note', noteSchema);
