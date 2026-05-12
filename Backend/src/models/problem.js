// Filename: src/models/problem.js
const mongoose = require('mongoose');

const testcaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  }
});

const solutionSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true
  },
  completeCode: {
    type: String,
    required: true
  }
});



const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  contestId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Contest",
  default: null,
},
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  visibletestcases: [testcaseSchema],
  hiddentestcases: [testcaseSchema],
  referenceSolution: [solutionSchema],

    starterCode: [
    {
      language: String,
      intialCode: String
    }
  ],

  driverCode: [
    {
      language: String,
      code: String
    }
  ],


  problemCreator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;

