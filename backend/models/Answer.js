const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'Question ID is required']
  },
  userAnswer: {
    type: String,
    required: [true, 'User answer is required'],
    trim: true
  },
  score: {
    type: Number,
    min: [0, 'Score must be non-negative'],
    max: [10, 'Score cannot exceed 10']
  },
  feedback: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Answer', answerSchema);