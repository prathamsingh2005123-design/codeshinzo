// Filename: src/models/user.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 30
    },
    LastName: {
        type: String,
        minlength: 3,
        maxlength: 30
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true
    },
    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user"
    },
    stats: {
  totalSubmissions: { type: Number, default: 0 },
  acceptedSubmissions: { type: Number, default: 0 },
  totalSolved: { type: Number, default: 0 }
},
    rating: {
        type: Number,
        default: 0
    },
   problemsSolved: {
  type: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem'
  }],
  default: []
},
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;