import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Target',
    required: true
  },
  status: {
    type: String,
    enum: ['UP', 'DOWN', 'ERROR'],
    required: true
  },
  responseTime: {
    type: Number,
    default: null // in milliseconds
  },
  statusCode: {
    type: Number,
    default: null // HTTP status code
  },
  errorMessage: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  url: {
    type: String,
    required: true
  }
});

// Index for faster queries
logSchema.index({ targetId: 1, timestamp: -1 });
logSchema.index({ timestamp: -1 });

const Log = mongoose.model('Log', logSchema);

export default Log;