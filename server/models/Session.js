import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: String,
  image: String, // base64 encoded image
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const componentSchema = new mongoose.Schema({
  jsx: String,
  css: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    default: 'Untitled Session'
  },
  messages: [messageSchema],
  currentComponent: componentSchema,
  componentHistory: [componentSchema],
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  created: {
    type: Date,
    default: Date.now
  }
});

// Update lastAccessed on every query
sessionSchema.pre(['find', 'findOne', 'findOneAndUpdate'], function() {
  this.set({ lastAccessed: new Date() });
});

const Session = mongoose.model("Session", sessionSchema);
export default Session;