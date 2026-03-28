const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  idealAnswer: {
    type: String,
    required: [true, 'Ideal answer is required'],
    trim: true
  },
  role: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['greeting', 'resume', 'technical', 'project', 'behavioral', 'company', 'closing'],
      message: 'Category must be one of: greeting, resume, technical, project, behavioral, company, closing'
    }
  },
  orderIndex: {
    type: Number,
    required: [true, 'Order index is required'],
    min: [0, 'Order index must be non-negative']
  }
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Question', questionSchema);